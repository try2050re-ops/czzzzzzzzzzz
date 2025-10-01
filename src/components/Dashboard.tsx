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
import "./Dashboard.css";

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

  const StatCard = ({ title, value, icon: Icon, iconColor, borderColor }: {
    title: string;
    value: string | number;
    icon: any;
    iconColor: string;
    borderColor: string;
  }) => (
    <Card className="stat-card hover-lift bg-gradient-to-br from-[#252525] to-[#1b1b1b] border-2" style={{ borderColor }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[#57AAB4]">
          {title}
        </CardTitle>
        <Icon className="h-6 w-6" style={{ color: iconColor, filter: `drop-shadow(0 0 8px ${iconColor})` }} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold glow-text" style={{ color: iconColor }}>
          {value}
        </div>
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
      <h2 className="text-4xl font-bold text-center mb-8 text-[#57AAB4] glow-text">
        لوحة التحكم
      </h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي العملاء"
          value={stats.totalCustomers}
          icon={Users}
          iconColor="#57AAB4"
          borderColor="rgba(87, 170, 180, 0.3)"
        />
        <StatCard
          title="العملاء المدفوعون"
          value={stats.paidCustomers}
          icon={CheckCircle}
          iconColor="#10b981"
          borderColor="rgba(16, 185, 129, 0.3)"
        />
        <StatCard
          title="التجديدات المكتملة"
          value={stats.renewedCustomers}
          icon={AlertCircle}
          iconColor="#3b82f6"
          borderColor="rgba(59, 130, 246, 0.3)"
        />
        <StatCard
          title="إجمالي الإيرادات"
          value={`${stats.totalRevenue.toLocaleString()} جنيه`}
          icon={DollarSign}
          iconColor="#f59e0b"
          borderColor="rgba(245, 158, 11, 0.3)"
        />
      </div>

      <Card className="animate-scale-in glass-effect bg-gradient-to-br from-[#252525] to-[#1b1b1b] border-2 border-[#57AAB4]/30">
        <CardHeader>
          <CardTitle
            className="flex items-center justify-between cursor-pointer text-[#57AAB4] hover:text-[#57AAB4]/80 transition-colors"
            onClick={() => setShowNotes(!showNotes)}
          >
            <span className="glow-text">ملاحظات المدير ({adminNotes.length})</span>
            {showNotes ? (
              <ChevronUp className="h-5 w-5" style={{ filter: 'drop-shadow(0 0 5px rgba(87, 170, 180, 0.5))' }} />
            ) : (
              <ChevronDown className="h-5 w-5" style={{ filter: 'drop-shadow(0 0 5px rgba(87, 170, 180, 0.5))' }} />
            )}
          </CardTitle>
        </CardHeader>
        {showNotes && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-note" className="text-[#57AAB4]">إضافة ملاحظة جديدة</Label>
            <div className="flex gap-2">
              <Textarea
                id="new-note"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="اكتب ملاحظتك هنا..."
                className="flex-1 text-right bg-[#1b1b1b]/50 border-[#57AAB4]/30 text-white placeholder:text-gray-500 focus:border-[#57AAB4] transition-colors"
                rows={3}
              />
              <Button
                onClick={addNote}
                disabled={savingNote || !newNote.trim()}
                className="bg-gradient-to-r from-[#57AAB4] to-[#03a9f4] hover:from-[#03a9f4] hover:to-[#57AAB4] transition-all duration-300"
                style={{ boxShadow: '0 0 15px rgba(87, 170, 180, 0.3)' }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-lg text-[#57AAB4]">الملاحظات المحفوظة</h4>
            {loadingNotes ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#57AAB4] mx-auto"></div>
              </div>
            ) : adminNotes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">لا توجد ملاحظات محفوظة</p>
            ) : (
              adminNotes.map((note, index) => (
                <Card
                  key={note.id}
                  className="animate-slide-in-right bg-[#1b1b1b]/70 border border-[#57AAB4]/20 hover:border-[#57AAB4]/40 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-4">
                    {editingNote?.id === note.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingNote.content}
                          onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                          className="bg-[#1b1b1b] border-[#57AAB4]/30 text-white text-right focus:border-[#57AAB4]"
                          rows={3}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingNote(null)}
                            className="text-gray-400 hover:text-gray-300 hover:bg-gray-800"
                          >
                            إلغاء
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateNote(note.id, editingNote.content)}
                            className="text-[#10b981] hover:text-[#10b981]/80 hover:bg-[#10b981]/10"
                          >
                            حفظ
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <p className="text-white text-right mb-2">{note.note_content}</p>
                          <p className="text-xs text-[#57AAB4]/60">
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
                            className="text-[#3b82f6] hover:text-[#3b82f6]/80 hover:bg-[#3b82f6]/10 transition-all"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog open={deleteNoteId === note.id} onOpenChange={(open) => !open && setDeleteNoteId(null)}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteNoteId(note.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#1b1b1b] border-[#57AAB4]/30">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-[#57AAB4]">حذف الملاحظة</AlertDialogTitle>
                                <AlertDialogDescription className="text-right text-gray-400">
                                  هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700">إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteNote(note.id)}
                                  className="bg-red-600 text-white hover:bg-red-700"
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
        <Card className="animate-scale-in stat-card hover-lift bg-gradient-to-br from-[#252525] to-[#1b1b1b] border-2 border-[#10b981]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#57AAB4]">
              <CheckCircle className="h-5 w-5 text-[#10b981]" style={{ filter: 'drop-shadow(0 0 8px #10b981)' }} />
              معدل الدفع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[#10b981] glow-text">
              {stats.totalCustomers > 0
                ? Math.round((stats.paidCustomers / stats.totalCustomers) * 100)
                : 0}%
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {stats.paidCustomers} من {stats.totalCustomers} عميل دفعوا
            </p>
          </CardContent>
        </Card>

        <Card className="animate-scale-in stat-card hover-lift bg-gradient-to-br from-[#252525] to-[#1b1b1b] border-2 border-[#3b82f6]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#57AAB4]">
              <AlertCircle className="h-5 w-5 text-[#3b82f6]" style={{ filter: 'drop-shadow(0 0 8px #3b82f6)' }} />
              معدل التجديد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[#3b82f6] glow-text">
              {stats.totalCustomers > 0
                ? Math.round((stats.renewedCustomers / stats.totalCustomers) * 100)
                : 0}%
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {stats.renewedCustomers} من {stats.totalCustomers} عميل جددوا
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};