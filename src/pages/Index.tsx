import { useState } from 'react';
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

interface Server {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'starting';
  players: number;
  maxPlayers: number;
  uptime: string;
  cpu: number;
  ram: number;
  template: string;
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
  const [activeTab, setActiveTab] = useState('home');
  const [servers] = useState<Server[]>([
    {
      id: '1',
      name: 'Мой RolePlay Сервер',
      status: 'online',
      players: 45,
      maxPlayers: 100,
      uptime: '3д 14ч',
      cpu: 45,
      ram: 62,
      template: 'RolePlay'
    },
    {
      id: '2',
      name: 'DeathMatch Arena',
      status: 'online',
      players: 28,
      maxPlayers: 50,
      uptime: '1д 8ч',
      cpu: 32,
      ram: 48,
      template: 'DeathMatch'
    }
  ]);

  const [selectedServer, setSelectedServer] = useState<Server | null>(servers[0]);
  const [serverConfig, setServerConfig] = useState({
    maxPlayers: 100,
    autoRestart: true,
    backupEnabled: true,
    gameMode: 'roleplay'
  });

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
            <Button className="glow">
              <Icon name="User" className="mr-2" size={16} />
              Личный кабинет
            </Button>
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
              <Button className="glow">
                <Icon name="Plus" className="mr-2" size={16} />
                Создать сервер
              </Button>
            </div>

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
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Игроки</span>
                      <span className="font-semibold">
                        {server.players}/{server.maxPlayers}
                      </span>
                    </div>
                    <Progress value={(server.players / server.maxPlayers) * 100} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">CPU</div>
                        <div className="flex items-center gap-2">
                          <Progress value={server.cpu} className="h-1.5" />
                          <span className="text-xs font-medium">{server.cpu}%</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">RAM</div>
                        <div className="flex items-center gap-2">
                          <Progress value={server.ram} className="h-1.5" />
                          <span className="text-xs font-medium">{server.ram}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <Icon name="Play" className="mr-1" size={14} />
                        Перезапуск
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Icon name="Settings" className="mr-1" size={14} />
                        Настройки
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedServer && (
              <Card className="border-primary glow">
                <CardHeader>
                  <CardTitle>Панель управления: {selectedServer.name}</CardTitle>
                  <CardDescription>Настройте параметры вашего сервера</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="config" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="config">Конфигурация</TabsTrigger>
                      <TabsTrigger value="monitor">Мониторинг</TabsTrigger>
                      <TabsTrigger value="backup">Бэкапы</TabsTrigger>
                    </TabsList>
                    <TabsContent value="config" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxplayers">Макс. игроков: {serverConfig.maxPlayers}</Label>
                        <Slider
                          id="maxplayers"
                          value={[serverConfig.maxPlayers]}
                          onValueChange={(val) => setServerConfig({...serverConfig, maxPlayers: val[0]})}
                          max={200}
                          min={10}
                          step={10}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="autorestart">Автоперезагрузка</Label>
                        <Switch
                          id="autorestart"
                          checked={serverConfig.autoRestart}
                          onCheckedChange={(val) => setServerConfig({...serverConfig, autoRestart: val})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="backup">Автобэкапы</Label>
                        <Switch
                          id="backup"
                          checked={serverConfig.backupEnabled}
                          onCheckedChange={(val) => setServerConfig({...serverConfig, backupEnabled: val})}
                        />
                      </div>
                      <Button className="w-full glow">
                        <Icon name="Save" className="mr-2" size={16} />
                        Сохранить настройки
                      </Button>
                    </TabsContent>
                    <TabsContent value="monitor" className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Онлайн игроков</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold text-primary">{selectedServer.players}</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Аптайм</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold text-secondary">{selectedServer.uptime}</div>
                          </CardContent>
                        </Card>
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

      <footer className="border-t border-border mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 SA-MP Host. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;