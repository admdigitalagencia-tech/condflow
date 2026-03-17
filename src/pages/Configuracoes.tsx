import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, Camera, Shield, Loader2 } from 'lucide-react';

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  role_title: string;
  preferred_language: string;
  timezone: string;
  date_format: string;
  avatar_url: string;
}

const TIMEZONES = [
  'Europe/Lisbon',
  'Europe/London',
  'Europe/Madrid',
  'Europe/Paris',
  'Europe/Berlin',
  'America/Sao_Paulo',
  'America/New_York',
  'Atlantic/Azores',
];

export default function Configuracoes() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    role_title: '',
    preferred_language: 'pt',
    timezone: 'Europe/Lisbon',
    date_format: 'DD/MM/YYYY',
    avatar_url: '',
  });

  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setProfile({
        full_name: data.full_name || '',
        email: data.email || user.email || '',
        phone: data.phone || '',
        role_title: (data as any).role_title || '',
        preferred_language: (data as any).preferred_language || 'pt',
        timezone: (data as any).timezone || 'Europe/Lisbon',
        date_format: (data as any).date_format || 'DD/MM/YYYY',
        avatar_url: data.avatar_url || '',
      });
    } else if (!error) {
      setProfile(prev => ({ ...prev, email: user.email || '' }));
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        role_title: profile.role_title,
        preferred_language: profile.preferred_language,
        timezone: profile.timezone,
        date_format: profile.date_format,
      } as any)
      .eq('user_id', user.id);

    setSaving(false);
    if (error) {
      toast.error('Erro ao salvar perfil');
    } else {
      toast.success('Perfil atualizado com sucesso');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB');
      return;
    }

    setUploadingAvatar(true);
    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error('Erro ao enviar imagem');
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    
    setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));

    await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl } as any)
      .eq('user_id', user.id);

    setUploadingAvatar(false);
    toast.success('Avatar atualizado');
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword.length < 6) {
      toast.error('A nova palavra-passe deve ter pelo menos 6 caracteres');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('As palavras-passe não coincidem');
      return;
    }

    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.newPassword });
    setChangingPassword(false);

    if (error) {
      toast.error('Erro ao alterar palavra-passe');
    } else {
      toast.success('Palavra-passe alterada com sucesso');
      setPasswords({ newPassword: '', confirmPassword: '' });
    }
  };

  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Gerencie o seu perfil e preferências da conta"
      />

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent">
              <User className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>Atualize os seus dados pessoais e preferências</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="h-20 w-20 border-2 border-border">
                {profile.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                ) : null}
                <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {uploadingAvatar ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Foto de perfil</p>
              <p className="text-xs text-muted-foreground">JPG, PNG até 2MB</p>
            </div>
          </div>

          <Separator />

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Nome completo</Label>
              <Input
                value={profile.full_name}
                onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                placeholder="O seu nome"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile.email} readOnly className="bg-muted/50 cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                placeholder="+351 912 345 678"
              />
            </div>
            <div className="space-y-2">
              <Label>Cargo / Função</Label>
              <Input
                value={profile.role_title}
                onChange={e => setProfile(p => ({ ...p, role_title: e.target.value }))}
                placeholder="Gestor de Condomínios"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label>Idioma</Label>
              <Select value={profile.preferred_language} onValueChange={v => setProfile(p => ({ ...p, preferred_language: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="en">Inglês</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fuso horário</Label>
              <Select value={profile.timezone} onValueChange={v => setProfile(p => ({ ...p, timezone: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map(tz => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Formato de data</Label>
              <Select value={profile.date_format} onValueChange={v => setProfile(p => ({ ...p, date_format: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar alterações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent">
              <Shield className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <CardTitle>Segurança da Conta</CardTitle>
              <CardDescription>Altere a sua palavra-passe de acesso</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Nova palavra-passe</Label>
              <Input
                type="password"
                value={passwords.newPassword}
                onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirmar nova palavra-passe</Label>
              <Input
                type="password"
                value={passwords.confirmPassword}
                onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Repita a nova palavra-passe"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleChangePassword}
              disabled={changingPassword || !passwords.newPassword}
            >
              {changingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
              Alterar palavra-passe
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
