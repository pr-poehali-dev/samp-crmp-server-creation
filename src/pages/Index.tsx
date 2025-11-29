import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface Server {
  id: number;
  name: string;
  status: 'online' | 'offline' | 'starting';
  template: string;
  ip: string;
  port: number;
  ftp_host: string;
  ftp_port: number;
  ftp_username: string;
  ftp_password: string;
  max_players: number;
  cpu_usage: number;
  ram_usage: number;
  current_players: number;
  auto_restart: boolean;
  backup_enabled: boolean;
  is_free: boolean;
}

const templates = [
  { id: 'rp', name: 'RolePlay', icon: 'Users', description: 'Классический РП сервер' },
  { id: 'dm', name: 'DeathMatch', icon: 'Crosshair', description: 'Бои и PvP сражения' },
  { id: 'freeroam', name: 'FreeRoam', icon: 'Car', description: 'Свободное передвижение' },
];

const plans = [
  { name: 'Starter', price: '299', players: 50, ram: '2 GB', cpu: '2 ядра', storage: '10 GB' },
  { name: 'Pro', price: '599', players: 100, ram: '4 GB', cpu: '4 ядра', storage: '25 GB' },
  { name: 'Ultra', price: '999', players: 200, ram: '8 GB', cpu: '6 ядер', storage: '50 GB' },
];

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('home');
  const [isAuth, setIsAuth] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [balance, setBalance] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [newServerTemplate, setNewServerTemplate] = useState('roleplay');
  const [showBalanceDialog, setShowBalanceDialog] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuth(true);
      loadUserData(userData.user_id);
    }
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const serversData = await api.servers.list(userId);
      setServers(serversData.servers || []);
      
      const balanceData = await api.payments.getBalance(userId);
      setBalance(balanceData.balance || 0);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleAuth = async () => {
    setLoading(true);
    try {
      const result = authMode === 'login' 
        ? await api.auth.login(email, password)
        : await api.auth.register(email, password);
      
      if (result.success || result.token) {
        setUser(result);
        setIsAuth(true);
        localStorage.setItem('user', JSON.stringify(result));
        setShowAuthDialog(false);
        toast({ title: 'Успешно', description: authMode === 'login' ? 'Вы вошли в систему' : 'Аккаунт создан' });
        loadUserData(result.user_id);
      } else {
        toast({ title: 'Ошибка', description: result.error || 'Не удалось войти', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Проблема с подключением', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuth(false);
    setServers([]);
    setBalance(0);
    toast({ title: 'Выход', description: 'Вы вышли из системы' });
  };

  const handleCreateServer = async (isFree: boolean = false) => {
    if (!newServerName || !newServerTemplate) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    try {
      const result = await api.servers.create(user.user_id, newServerName, newServerTemplate, isFree);
      
      if (result.success) {
        toast({ title: 'Успешно', description: `Сервер создан! IP: ${result.ip}:${result.port}` });
        setShowCreateDialog(false);
        setNewServerName('');
        loadUserData(user.user_id);
      } else {
        toast({ title: 'Ошибка', description: result.error || 'Не удалось создать сервер', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Проблема с подключением', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleAddBalance = async () => {
    const amount = parseFloat(balanceAmount);
    if (!amount || amount <= 0) {
      toast({ title: 'Ошибка', description: 'Введите корректную сумму', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    try {
      const result = await api.payments.addBalance(user.user_id, amount);
      if (result.success) {
        setBalance(result.balance);
        setShowBalanceDialog(false);
        setBalanceAmount('');
        toast({ title: 'Успешно', description: `Баланс пополнен на ${amount}₽` });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось пополнить баланс', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleServerAction = async (serverId: number, action: 'start' | 'stop') => {
    setLoading(true);
    try {
      const result = action === 'start' 
        ? await api.servers.start(user.user_id, serverId)
        : await api.servers.stop(user.user_id, serverId);
      
      if (result.success) {
        toast({ title: 'Успешно', description: `Сервер ${action === 'start' ? 'запущен' : 'остановлен'}` });
        loadUserData(user.user_id);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось выполнить действие', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow">
                <Icon name="Server" className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                SA-MP Host
              </span>
            </div>
            <div className="hidden md:flex gap-6">
              {['home', 'servers', 'templates', 'pricing', 'support'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg transition-all font-medium ${
                    activeTab === tab
                      ? 'bg-primary text-primary-foreground glow'
                      : 'hover:bg-muted'
                  }`}
                >
                  {tab === 'home' && 'Главная'}
                  {tab === 'servers' && 'Мои серверы'}
                  {tab === 'templates' && 'Шаблоны'}
                  {tab === 'pricing' && 'Тарифы'}
                  {tab === 'support' && 'Поддержка'}
                </button>
              ))}
            </div>
            {isAuth ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Icon name="Wallet" size={20} className="text-primary" />
                  <span className="font-bold">{balance.toFixed(2)}₽</span>
                  <Button size="sm" variant="outline" onClick={() => setShowBalanceDialog(true)}>
                    <Icon name="Plus" size={14} className="mr-1" />
                    Пополнить
                  </Button>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  <Icon name="LogOut" className="mr-2" size={16} />
                  Выйти
                </Button>
              </div>
            ) : (
              <Button className="glow" onClick={() => setShowAuthDialog(true)}>
                <Icon name="User" className="mr-2" size={16} />
                Войти
              </Button>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'home' && (
          <div className="space-y-16">
            <section className="text-center py-20 animate-fade-in">
              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Создай свой SA-MP сервер
                <br />за 5 минут
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Мощный хостинг для SA-MP и CR-MP серверов с полным управлением,
                автобэкапами и круглосуточной поддержкой
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6 glow" onClick={() => setActiveTab('servers')}>
                  <Icon name="Rocket" className="mr-2" size={20} />
                  Создать сервер
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={() => setActiveTab('templates')}>
                  <Icon name="Eye" className="mr-2" size={20} />
                  Посмотреть шаблоны
                </Button>
              </div>
            </section>

            <section className="grid md:grid-cols-3 gap-6">
              {[
                { icon: 'Zap', title: 'Мгновенный запуск', desc: 'Сервер готов к работе за минуту' },
                { icon: 'Shield', title: 'Защита от DDoS', desc: 'Надежная защита от атак 24/7' },
                { icon: 'Database', title: 'MySQL включена', desc: 'База данных настроена и готова' },
                { icon: 'Settings', title: 'Полный контроль', desc: 'Управляйте всеми параметрами' },
                { icon: 'HardDrive', title: 'Автобэкапы', desc: 'Ежедневные резервные копии' },
                { icon: 'Headphones', title: 'Поддержка 24/7', desc: 'Всегда на связи с вами' }
              ].map((feature, idx) => (
                <Card key={idx} className="border-border hover:border-primary transition-all hover:glow group">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:glow transition-all">
                      <Icon name={feature.icon} className="text-primary" size={24} />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.desc}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </section>
          </div>
        )}

        {activeTab === 'servers' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Мои серверы</h2>
              <Button className="glow" onClick={() => setShowCreateDialog(true)} disabled={!isAuth}>
                <Icon name="Plus" className="mr-2" size={16} />
                Создать сервер
              </Button>
            </div>

            {!isAuth ? (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center">
                  <Icon name="Server" className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <h3 className="text-xl font-bold mb-2">Войдите, чтобы управлять серверами</h3>
                  <p className="text-muted-foreground mb-4">
                    Создайте аккаунт и получите 1 бесплатный сервер!
                  </p>
                  <Button onClick={() => setShowAuthDialog(true)} className="glow">
                    Войти или создать аккаунт
                  </Button>
                </CardContent>
              </Card>
            ) : servers.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center">
                  <Icon name="Plus" className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <h3 className="text-xl font-bold mb-2">У вас пока нет серверов</h3>
                  <p className="text-muted-foreground mb-4">
                    Создайте свой первый сервер бесплатно!
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)} className="glow">
                    <Icon name="Plus" className="mr-2" size={16} />
                    Создать бесплатный сервер
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {servers.map((server) => (
                <Card
                  key={server.id}
                  className={`border-border hover:border-primary transition-all cursor-pointer ${
                    selectedServer?.id === server.id ? 'border-primary glow' : ''
                  }`}
                  onClick={() => setSelectedServer(server)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {server.name}
                        {server.status === 'online' && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/50 animate-pulse-glow">
                            <div className="w-2 h-2 rounded-full bg-green-400 mr-1" />
                            Online
                          </Badge>
                        )}
                      </CardTitle>
                      <Button size="sm" variant="ghost">
                        <Icon name="MoreVertical" size={16} />
                      </Button>
                    </div>
                    <CardDescription>{server.template}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">IP:Порт</span>
                        <span className="font-mono font-semibold">{server.ip}:{server.port}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Игроки</span>
                        <span className="font-semibold">
                          {server.current_players}/{server.max_players}
                        </span>
                      </div>
                      <Progress value={(server.current_players / server.max_players) * 100} className="h-2" />
                      
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">CPU</div>
                          <div className="flex items-center gap-2">
                            <Progress value={server.cpu_usage} className="h-1.5" />
                            <span className="text-xs font-medium">{server.cpu_usage.toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">RAM</div>
                          <div className="flex items-center gap-2">
                            <Progress value={server.ram_usage} className="h-1.5" />
                            <span className="text-xs font-medium">{server.ram_usage.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                      
                      {server.is_free && (
                        <Badge variant="outline" className="w-fit">Бесплатный</Badge>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleServerAction(server.id, server.status === 'online' ? 'stop' : 'start');
                        }}
                        disabled={loading}
                      >
                        <Icon name={server.status === 'online' ? 'Square' : 'Play'} className="mr-1" size={14} />
                        {server.status === 'online' ? 'Остановить' : 'Запустить'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedServer(server);
                        }}
                      >
                        <Icon name="Settings" className="mr-1" size={14} />
                        Детали
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}

            {selectedServer && isAuth && (
              <Card className="border-primary glow">
                <CardHeader>
                  <CardTitle>Панель управления: {selectedServer.name}</CardTitle>
                  <CardDescription>Настройте параметры вашего сервера</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="info">Информация</TabsTrigger>
                      <TabsTrigger value="ftp">FTP Доступ</TabsTrigger>
                      <TabsTrigger value="config">Настройки</TabsTrigger>
                    </TabsList>
                    <TabsContent value="info" className="space-y-4 pt-4">
                      <div className="grid gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">IP Адрес</div>
                          <div className="font-mono font-bold text-lg">{selectedServer.ip}:{selectedServer.port}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm">Онлайн игроков</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-3xl font-bold text-primary">{selectedServer.current_players}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm">Макс. игроков</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-3xl font-bold text-secondary">{selectedServer.max_players}</div>
                            </CardContent>
                          </Card>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">CPU</div>
                            <div className="font-bold">{selectedServer.cpu_usage.toFixed(1)}%</div>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">RAM</div>
                            <div className="font-bold">{selectedServer.ram_usage.toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="ftp" className="space-y-4 pt-4">
                      <div className="p-4 bg-muted rounded-lg space-y-3">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">FTP Хост</div>
                          <div className="font-mono font-bold">{selectedServer.ftp_host}:{selectedServer.ftp_port}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Логин</div>
                          <div className="font-mono font-bold">{selectedServer.ftp_username}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Пароль</div>
                          <div className="font-mono font-bold">{selectedServer.ftp_password}</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground p-4 bg-card rounded-lg">
                        <p className="mb-2"><strong>Как подключиться:</strong></p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Скачайте FTP клиент (FileZilla, WinSCP)</li>
                          <li>Используйте данные выше для подключения</li>
                          <li>Загружайте и редактируйте файлы сервера</li>
                        </ol>
                      </div>
                    </TabsContent>
                    <TabsContent value="config" className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Автоперезагрузка</Label>
                          <p className="text-sm text-muted-foreground">Перезапуск при сбое</p>
                        </div>
                        <Switch
                          checked={selectedServer.auto_restart}
                          disabled
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Автобэкапы</Label>
                          <p className="text-sm text-muted-foreground">Ежедневное резервное копирование</p>
                        </div>
                        <Switch
                          checked={selectedServer.backup_enabled}
                          disabled
                        />
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Для изменения настроек свяжитесь с поддержкой
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="backup" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <div className="font-medium">backup_2025_01_15.sql</div>
                            <div className="text-sm text-muted-foreground">15.01.2025 14:30</div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Icon name="Download" size={14} />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold">Шаблоны серверов</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="border-border hover:border-primary transition-all hover:glow group cursor-pointer">
                  <CardHeader>
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:glow transition-all">
                      <Icon name={template.icon} className="text-primary" size={32} />
                    </div>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      <Icon name="Plus" className="mr-2" size={16} />
                      Использовать шаблон
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Тарифные планы</h2>
              <p className="text-muted-foreground">Выберите подходящий тариф для вашего сервера</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan, idx) => (
                <Card
                  key={plan.name}
                  className={`border-border hover:border-primary transition-all hover:glow ${
                    idx === 1 ? 'border-primary glow scale-105' : ''
                  }`}
                >
                  <CardHeader>
                    {idx === 1 && (
                      <Badge className="mb-2 w-fit bg-primary">Популярный</Badge>
                    )}
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="flex items-baseline gap-1 pt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">₽/мес</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon name="Check" className="text-green-400" size={16} />
                        <span>До {plan.players} игроков</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Check" className="text-green-400" size={16} />
                        <span>{plan.ram} RAM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Check" className="text-green-400" size={16} />
                        <span>{plan.cpu}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Check" className="text-green-400" size={16} />
                        <span>{plan.storage} SSD</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Check" className="text-green-400" size={16} />
                        <span>MySQL база данных</span>
                      </div>
                    </div>
                    <Button className="w-full" variant={idx === 1 ? 'default' : 'outline'}>
                      Выбрать план
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold">Поддержка</h2>
            <Card>
              <CardHeader>
                <CardTitle>Свяжитесь с нами</CardTitle>
                <CardDescription>Мы ответим в течение 24 часов</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Тема обращения</Label>
                  <Input id="subject" placeholder="Опишите проблему" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Сообщение</Label>
                  <textarea
                    id="message"
                    className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background"
                    placeholder="Подробно опишите вашу проблему"
                  />
                </div>
                <Button className="w-full glow">
                  <Icon name="Send" className="mr-2" size={16} />
                  Отправить
                </Button>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="MessageCircle" size={20} />
                    Discord
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">Присоединиться</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Mail" size={20} />
                    Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">support@samp-host.ru</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{authMode === 'login' ? 'Вход' : 'Регистрация'}</DialogTitle>
            <DialogDescription>
              {authMode === 'login' ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
              {authMode === 'login' ? 'Создать аккаунт' : 'Уже есть аккаунт?'}
            </Button>
            <Button onClick={handleAuth} disabled={loading}>
              {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать новый сервер</DialogTitle>
            <DialogDescription>
              Создайте бесплатный сервер или купите платный за 50₽
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="servername">Название сервера</Label>
              <Input 
                id="servername" 
                value={newServerName} 
                onChange={(e) => setNewServerName(e.target.value)}
                placeholder="Мой SA-MP сервер"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template">Шаблон</Label>
              <select 
                id="template"
                value={newServerTemplate}
                onChange={(e) => setNewServerTemplate(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
              >
                <option value="roleplay">RolePlay</option>
                <option value="deathmatch">DeathMatch</option>
                <option value="freeroam">FreeRoam</option>
              </select>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Ваш баланс: <strong>{balance.toFixed(2)}₽</strong></p>
              <p className="text-xs text-muted-foreground">
                {servers.filter(s => s.is_free).length === 0 
                  ? '✓ Вы можете создать 1 бесплатный сервер'
                  : 'Бесплатный сервер уже создан. Новые серверы - 50₽'}
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            {servers.filter(s => s.is_free).length === 0 && (
              <Button variant="outline" onClick={() => handleCreateServer(true)} disabled={loading}>
                <Icon name="Gift" className="mr-2" size={16} />
                Создать бесплатно
              </Button>
            )}
            <Button onClick={() => handleCreateServer(false)} disabled={loading || balance < 50}>
              <Icon name="Plus" className="mr-2" size={16} />
              Купить за 50₽
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBalanceDialog} onOpenChange={setShowBalanceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Пополнить баланс</DialogTitle>
            <DialogDescription>
              Текущий баланс: {balance.toFixed(2)}₽
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Сумма пополнения</Label>
              <Input 
                id="amount" 
                type="number" 
                value={balanceAmount} 
                onChange={(e) => setBalanceAmount(e.target.value)}
                placeholder="100"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 500].map(amount => (
                <Button 
                  key={amount} 
                  variant="outline" 
                  size="sm"
                  onClick={() => setBalanceAmount(amount.toString())}
                >
                  {amount}₽
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddBalance} disabled={loading}>
              Пополнить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="border-t border-border mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 SA-MP Host. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;