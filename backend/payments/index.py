'''
Business: Handle payments and balance operations
Args: event - dict with httpMethod, body, headers
      context - object with attributes: request_id, function_name
Returns: HTTP response dict with payment status or balance
'''

import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
            cursor.execute("SELECT balance FROM users WHERE id = %s", (user_id,))
            result = cursor.fetchone()
            
            if not result:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'})
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'balance': float(result[0])})
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'add_balance':
                amount = body_data.get('amount', 0)
                
                if amount <= 0:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid amount'})
                    }
                
                cursor.execute(
                    "UPDATE users SET balance = balance + %s WHERE id = %s RETURNING balance",
                    (amount, user_id)
                )
                new_balance = cursor.fetchone()[0]
                
                cursor.execute(
                    "INSERT INTO payments (user_id, amount, type, status) VALUES (%s, %s, %s, %s)",
                    (user_id, amount, 'deposit', 'completed')
                )
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'balance': float(new_balance)
                    })
                }
            
            elif action == 'get_history':
                cursor.execute(
                    """SELECT id, amount, type, status, created_at::text 
                       FROM payments WHERE user_id = %s ORDER BY created_at DESC LIMIT 20""",
                    (user_id,)
                )
                payments = cursor.fetchall()
                
                result = []
                for payment in payments:
                    result.append({
                        'id': payment[0],
                        'amount': float(payment[1]),
                        'type': payment[2],
                        'status': payment[3],
                        'created_at': payment[4]
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'payments': result})
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cursor.close()
        conn.close()
