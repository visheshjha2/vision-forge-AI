import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Image, Sparkles, Download, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Project {
  id: string;
  type: string;
  prompt: string;
  result_url: string | null;
  size: string | null;
  duration: number | null;
  status: string;
  created_at: string;
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchProjects = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects((data as Project[]) || []);
    } catch (error: any) {
      toast({ title: 'Error loading projects', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, [user]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setProjects(projects.filter((p) => p.id !== id));
      toast({ title: 'Project deleted', description: 'The project has been removed.' });
    } catch (error: any) {
      toast({ title: 'Error deleting project', description: error.message, variant: 'destructive' });
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (project: Project) => {
    if (!project.result_url) return;
    try {
      const resp = await fetch(project.result_url);
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vision-forge-${project.type}-${project.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(project.result_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold mb-2">Projects</h1>
        <p className="text-muted-foreground mb-8">View and manage your generated content</p>

        {projects.length === 0 ? (
          <div className="dashboard-card text-center py-16">
            <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground">Start creating to see your projects here</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="dashboard-card group"
              >
                <div className="aspect-square rounded-xl bg-muted/50 mb-4 overflow-hidden relative">
                  {project.result_url ? (
                    <img src={project.result_url} alt={project.prompt} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {project.type === 'enhancement' ? (
                        <Sparkles className="w-8 h-8 text-muted-foreground/50" />
                      ) : (
                        <Image className="w-8 h-8 text-muted-foreground/50" />
                      )}
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur-sm">
                      {project.type === 'enhancement' ? (
                        <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Enhanced</span>
                      ) : (
                        <span className="flex items-center gap-1"><Image className="w-3 h-3" /> Image</span>
                      )}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-foreground line-clamp-2 mb-2">{project.prompt}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>{project.size || ''}</span>
                  <span>{format(new Date(project.created_at), 'MMM d, yyyy')}</span>
                </div>

                <div className="flex gap-2">
                  {project.result_url && (
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownload(project)}>
                      <Download className="w-4 h-4 mr-1" />Download
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(project.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          {deleting === project.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Projects;
