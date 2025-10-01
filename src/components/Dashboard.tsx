import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Plus, Trash2, CreditCard as Edit, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface DashboardStats {
  totalCustomers: number;
  paidCustomers: number;
  renewedCustomers: number;
  totalRevenue: number;
}

interface AdminNote {
  id: string;
  note_content: string;
  created_at: string;
  updated_at: string;
}
export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    paidCustomers: 0,
    renewedCustomers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState<AdminNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [editingNote, setEditingNote] = useState<{id: string, content: string} | null>(null);
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
    fetchAdminNotes();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: customers, error } = await supabase
        .from('customers')
        .select('payment_status, renewal_status, monthly_price');

      if (error) throw error;

      const totalCustomers = customers?.length || 0;
      const paidCustomers = customers?.filter(c => c.payment_status === 'دفع').length || 0;
      const renewedCustomers = customers?.filter(c => c.renewal_status === 'تم').length || 0;
      const totalRevenue = customers?.reduce((sum, c) => sum + (c.monthly_price || 0), 0) || 0;

      setStats({
        totalCustomers,
        paidCustomers,
        renewedCustomers,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "خطأ",
        description: `فشل في تحميل الإحصائيات: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdminNotes(data || []);
    } catch (error) {
      console.error('Error fetching admin notes:', error);
      toast({
        title: "خطأ",
        description: `فشل في تحميل الملاحظات: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoadingNotes(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    
    setSavingNote(true);
    try {
      const { error } = await supabase
        .from('admin_notes')
        .insert([{ note_content: newNote.trim() }]);

      if (error) throw error;

      setNewNote("");
      fetchAdminNotes();
      toast({
        title: "تم بنجاح",
        description: "تم إضافة الملاحظة بنجاح",
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "خطأ",
        description: `فشل في إضافة الملاحظة: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSavingNote(false);
    }
  };

  const updateNote = async (noteId: string, content: string) => {
    if (!content.trim()) return;

    try {
      const { error } = await supabase
        .from('admin_notes')
        .update({ note_content: content.trim() })
        .eq('id', noteId);

      if (error) throw error;

      setEditingNote(null);
      fetchAdminNotes();
      toast({
        title: "تم بنجاح",
        description: "تم تحديث الملاحظة بنجاح",
      });
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "خطأ",
        description: `فشل في تحديث الملاحظة: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setDeleteNoteId(null);
      fetchAdminNotes();
      toast({
        title: "تم بنجاح",
        description: "تم حذف الملاحظة بنجاح",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "خطأ",
        description: `فشل في حذف الملاحظة: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const StatCard = ({ title, value, icon: Icon, className = "" }: {
    title: string;
    value: string | number;
    icon: any;
    className?: string;
  }) => (
    <Card className={`hover-scale transition-all duration-300 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-center mb-8">لوحة التحكم</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي العملاء"
          value={stats.totalCustomers}
          icon={Users}
          className="animate-fade-in bg-black/80 text-white border-gray-600"
        />
        <StatCard
          title="العملاء المدفوعون"
          value={stats.paidCustomers}
          icon={CheckCircle}
          className="animate-fade-in bg-black/80 text-white border-green-600"
        />
        <StatCard
          title="التجديدات المكتملة"
          value={stats.renewedCustomers}
          icon={AlertCircle}
          className="animate-fade-in bg-black/80 text-white border-blue-600"
        />
        <StatCard
          title="إجمالي الإيرادات"
          value={`${stats.totalRevenue.toLocaleString()} جنيه`}
          icon={DollarSign}
          className="animate-fade-in bg-black/80 text-white border-yellow-600"
        />
      </div>

      {/* ملاحظات المدير */}
      <Card className="animate-scale-in bg-black/80 text-white border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center justify-between cursor-pointer" onClick={() => setShowNotes(!showNotes)}>
            <span>ملاحظات المدير ({adminNotes.length})</span>
            {showNotes ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        {showNotes && (
        <CardContent className="space-y-4">
          {/* إضافة ملاحظة جديدة */}
          <div className="space-y-2">
            <Label htmlFor="new-note">إضافة ملاحظة جديدة</Label>
            <div className="flex gap-2">
              <Textarea
                id="new-note"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="اكتب ملاحظتك هنا..."
                className="flex-1 text-right bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                rows={3}
              />
              <Button
                onClick={addNote}
                disabled={savingNote || !newNote.trim()}
                className="hover-scale bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* عرض الملاحظات */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">الملاحظات المحفوظة</h4>
            {loadingNotes ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
              </div>
            ) : adminNotes.length === 0 ? (
              <p className="text-gray-400 text-center py-4">لا توجد ملاحظات محفوظة</p>
            ) : (
              adminNotes.map((note) => (
                <Card key={note.id} className="bg-gray-800/50 border-gray-600">
                  <CardContent className="p-4">
                    {editingNote?.id === note.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingNote.content}
                          onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                          className="bg-gray-700/50 border-gray-500 text-white text-right"
                          rows={3}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingNote(null)}
                            className="text-gray-400 hover:text-gray-300"
                          >
                            إلغاء
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateNote(note.id, editingNote.content)}
                            className="text-green-400 hover:text-green-300"
                          >
                            حفظ
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <p className="text-white text-right mb-2">{note.note_content}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(note.created_at).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingNote({ id: note.id, content: note.note_content })}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog open={deleteNoteId === note.id} onOpenChange={(open) => !open && setDeleteNoteId(null)}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteNoteId(note.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف الملاحظة</AlertDialogTitle>
                                <AlertDialogDescription className="text-right">
                                  هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteNote(note.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="animate-scale-in bg-black/80 text-white border-gray-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              معدل الدفع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats.totalCustomers > 0 
                ? Math.round((stats.paidCustomers / stats.totalCustomers) * 100)
                : 0}%
            </div>
            <p className="text-sm text-gray-300">
              {stats.paidCustomers} من {stats.totalCustomers} عميل دفعوا
            </p>
          </CardContent>
        </Card>

        <Card className="animate-scale-in bg-black/80 text-white border-gray-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              معدل التجديد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {stats.totalCustomers > 0 
                ? Math.round((stats.renewedCustomers / stats.totalCustomers) * 100)
                : 0}%
            </div>
            <p className="text-sm text-gray-300">
              {stats.renewedCustomers} من {stats.totalCustomers} عميل جددوا
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};