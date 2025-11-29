'''
Business: Manage game servers (create, list, update, delete)
Args: event - dict with httpMethod, body, queryStringParameters, headers
      context - object with attributes: request_id, function_name
Returns: HTTP response dict with server data
'''

import json
import os
import psycopg2
import random
import string
from typing import Dict, Any

def generate_ftp_credentials() -> tuple:
    username = 'samp_' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    password = ''.join(random.choices(string.ascii_letters + string.digits, k=16))
    return username, password

def generate_server_port() -> int:
    return random.randint(7777, 8777)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            cursor.execute(
                """SELECT id, name, template, status, ip, port, ftp_host, ftp_port, 
                          ftp_username, ftp_password, max_players, cpu_usage, ram_usage, 
                          current_players, auto_restart, backup_enabled, is_free, 
                          created_at::text 
                   FROM servers WHERE user_id = %s ORDER BY created_at DESC""",
                (user_id,)
            )
            servers = cursor.fetchall()
            
            result = []
            for server in servers:
                result.append({
                    'id': server[0],
                    'name': server[1],
                    'template': server[2],
                    'status': server[3],
                    'ip': server[4],
                    'port': server[5],
                    'ftp_host': server[6],
                    'ftp_port': server[7],
                    'ftp_username': server[8],
                    'ftp_password': server[9],
                    'max_players': server[10],
                    'cpu_usage': float(server[11]),
                    'ram_usage': float(server[12]),
                    'current_players': server[13],
                    'auto_restart': server[14],
                    'backup_enabled': server[15],
                    'is_free': server[16],
                    'created_at': server[17]
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'servers': result})
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            name = body_data.get('name')
            template = body_data.get('template')
            is_free = body_data.get('is_free', False)
            
            if not name or not template:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Name and template required'})
                }
            
            if is_free:
                cursor.execute(
                    "SELECT COUNT(*) FROM servers WHERE user_id = %s AND is_free = true",
                    (user_id,)
                )
                free_count = cursor.fetchone()[0]
                if free_count >= 1:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Free server limit reached'})
                    }
            else:
                cursor.execute("SELECT balance FROM users WHERE id = %s", (user_id,))
                balance = cursor.fetchone()[0]
                if balance < 50:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Insufficient balance'})
                    }
                
                cursor.execute(
                    "UPDATE users SET balance = balance - 50 WHERE id = %s",
                    (user_id,)
                )
                
                cursor.execute(
                    "INSERT INTO payments (user_id, amount, type, status) VALUES (%s, %s, %s, %s)",
                    (user_id, 50.00, 'server_purchase', 'completed')
                )
            
            ftp_username, ftp_password = generate_ftp_credentials()
            port = generate_server_port()
            ip = '185.104.248.123'
            
            cursor.execute(
                """INSERT INTO servers 
                   (user_id, name, template, status, ip, port, ftp_host, ftp_port, 
                    ftp_username, ftp_password, max_players, is_free) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) 
                   RETURNING id""",
                (user_id, name, template, 'offline', ip, port, ip, 21, 
                 ftp_username, ftp_password, 50, is_free)
            )
            server_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': True,
                    'server_id': server_id,
                    'ip': ip,
                    'port': port,
                    'ftp_host': ip,
                    'ftp_username': ftp_username,
                    'ftp_password': ftp_password
                })
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            server_id = body_data.get('server_id')
            action = body_data.get('action')
            
            if action == 'update_config':
                max_players = body_data.get('max_players')
                auto_restart = body_data.get('auto_restart')
                backup_enabled = body_data.get('backup_enabled')
                
                cursor.execute(
                    """UPDATE servers 
                       SET max_players = %s, auto_restart = %s, backup_enabled = %s, 
                           updated_at = CURRENT_TIMESTAMP 
                       WHERE id = %s AND user_id = %s""",
                    (max_players, auto_restart, backup_enabled, server_id, user_id)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'start':
                cursor.execute(
                    "UPDATE servers SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s AND user_id = %s",
                    ('online', server_id, user_id)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'status': 'online'})
                }
            
            elif action == 'stop':
                cursor.execute(
                    "UPDATE servers SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s AND user_id = %s",
                    ('offline', server_id, user_id)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'status': 'offline'})
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cursor.close()
        conn.close()
