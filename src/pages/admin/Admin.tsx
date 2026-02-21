import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Image, Sparkles, Trash2, UserX, UserCheck, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  status: string;
  created_at: string;
}

interface AdminProject {
  id: string;
  user_id: string;
  type: string;
  prompt: string;
  result_url: string | null;
  status: string;
  created_at: string;
}

const Admin = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProjectCounts, setUserProjectCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState({ totalUsers: 0, totalImages: 0, totalEnhancements: 0 });
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers((usersData as UserProfile[]) || []);

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects((projectsData as AdminProject[]) || []);

      const counts: Record<string, number> = {};
      projectsData?.forEach(p => { counts[p.user_id] = (counts[p.user_id] || 0) + 1; });
      setUserProjectCounts(counts);

      setStats({
        totalUsers: usersData?.length || 0,
        totalImages: projectsData?.filter(p => p.type === 'image').length || 0,
        totalEnhancements: projectsData?.filter(p => p.type === 'enhancement').length || 0,
      });
    } catch (error: any) {
      toast({ title: 'Error loading data', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setProjects(projects.filter((p) => p.id !== id));
      toast({ title: 'Project deleted' });
    } catch (error: any) {
      toast({ title: 'Error deleting project', description: error.message, variant: 'destructive' });
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', userId);
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      toast({ title: `User ${newStatus === 'active' ? 'enabled' : 'disabled'}` });
    } catch (error: any) {
      toast({ title: 'Error updating user', description: error.message, variant: 'destructive' });
    }
  };

  const getUserEmail = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.email || userId.slice(0, 8) + '...';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-0">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Panel</h1>
        </div>
        <p className="text-muted-foreground mb-8">Manage users and projects</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="dashboard-card">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-gradient-purple to-gradient-pink flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-gradient-pink to-gradient-yellow flex items-center justify-center shrink-0">
                <Image className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{stats.totalImages}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Images Generated</p>
              </div>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-gradient-yellow to-gradient-orange flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{stats.totalEnhancements}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Images Enhanced</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto grid grid-cols-2 sm:flex gap-1">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="dashboard-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden sm:table-cell">Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gens</TableHead>
                    <TableHead className="hidden sm:table-cell">Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-sm max-w-[150px] truncate">{user.email}</TableCell>
                      <TableCell className="hidden sm:table-cell">{user.full_name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>{user.status}</Badge>
                      </TableCell>
                      <TableCell>{userProjectCounts[user.id] || 0}</TableCell>
                      <TableCell className="hidden sm:table-cell">{format(new Date(user.created_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              {user.status === 'active' ? <UserX className="w-4 h-4 text-destructive" /> : <UserCheck className="w-4 h-4 text-green-600" />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{user.status === 'active' ? 'Disable User' : 'Enable User'}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {user.status === 'active' ? 'This user will no longer be able to generate content.' : 'This user will be able to generate content again.'}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleToggleUserStatus(user.id, user.status)}
                                className={user.status === 'active' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-green-600 hover:bg-green-700'}
                              >
                                {user.status === 'active' ? 'Disable' : 'Enable'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="projects">
            <div className="dashboard-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Prompt</TableHead>
                    <TableHead className="hidden sm:table-cell">User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <span className="flex items-center gap-1 text-sm">
                          {project.type === 'enhancement' ? <Sparkles className="w-4 h-4" /> : <Image className="w-4 h-4" />}
                          <span className="hidden sm:inline">{project.type}</span>
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">{project.prompt}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{getUserEmail(project.user_id)}</TableCell>
                      <TableCell>
                        <Badge variant={project.status === 'completed' ? 'default' : project.status === 'processing' ? 'secondary' : 'destructive'}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{format(new Date(project.created_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Project</AlertDialogTitle>
                              <AlertDialogDescription>Are you sure you want to delete this project?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteProject(project.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Admin;
