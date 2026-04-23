import { Plus, Save, Pencil, Trash2, GripVertical, BookOpen, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import { useAuth } from "../providers/AuthProvider";
import { useUsers } from "../providers/UsersProvider";
import { supabase } from "../utils/supabase";
import { EmptyState } from "@/components/ui/EmptyState";

type RuleBlock = {
  id: string;
  sort_order: number;
  title: string;
  content: string;
};

function SkeletonBlock() {
  return (
    <Card className="shadow-sm py-0">
      <CardContent className="p-5">
        <div className="h-5 bg-muted rounded animate-pulse w-2/5 mb-3" />
        <div className="h-px bg-border mb-3" />
        <div className="space-y-2">
          <div className="h-3.5 bg-muted rounded animate-pulse w-full" />
          <div className="h-3.5 bg-muted rounded animate-pulse w-4/5" />
          <div className="h-3.5 bg-muted rounded animate-pulse w-3/5" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Rules() {
  const { user: authUser } = useAuth();
  const { users } = useUsers();
  const currentUser = users.find((u) => u.user_id === authUser?.id);
  const isAdmin = currentUser?.is_admin ?? false;

  const [blocks, setBlocks] = useState<RuleBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("rule_block")
      .select("id, sort_order, title, content")
      .order("sort_order", { ascending: true });
    if (!error && data) setBlocks(data as RuleBlock[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBlocks(); }, [fetchBlocks]);

  const handleAddBlock = () => {
    const maxOrder = blocks.reduce((max, b) => Math.max(max, b.sort_order), 0);
    setBlocks((prev) => [...prev, {
      id: `new-${Date.now()}`,
      sort_order: maxOrder + 10,
      title: "Novi odjeljak",
      content: "",
    }]);
  };

  const handleUpdate = (id: string, field: "title" | "content", value: string) => {
    setBlocks((prev) => prev.map((b) => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleDelete = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    const reordered = blocks.map((b, i) => ({ ...b, sort_order: (i + 1) * 10 }));
    const toUpsert = reordered.filter((b) => !b.id.startsWith("new-")).map((b) => ({
      id: b.id, sort_order: b.sort_order, title: b.title, content: b.content, updated_at: new Date().toISOString(),
    }));
    const toInsert = reordered.filter((b) => b.id.startsWith("new-")).map((b) => ({
      sort_order: b.sort_order, title: b.title, content: b.content,
    }));
    const { data: existing } = await supabase.from("rule_block").select("id");
    const existingIds = (existing ?? []).map((r: { id: string }) => r.id);
    const remainingIds = reordered.filter((b) => !b.id.startsWith("new-")).map((b) => b.id);
    const toDelete = existingIds.filter((id) => !remainingIds.includes(id));

    let hasError = false;
    if (toDelete.length > 0 && (await supabase.from("rule_block").delete().in("id", toDelete)).error) hasError = true;
    if (toUpsert.length > 0 && (await supabase.from("rule_block").upsert(toUpsert)).error) hasError = true;
    if (toInsert.length > 0 && (await supabase.from("rule_block").insert(toInsert)).error) hasError = true;

    setSaving(false);
    if (!hasError) {
      toast.success("Pravila su uspješno spremljena!");
      setEditing(false);
      await fetchBlocks();
    } else {
      toast.error("Greška pri spremanju pravila.");
    }
  };

  const handleCancel = async () => {
    setEditing(false);
    await fetchBlocks();
  };

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragEnter = (index: number) => { dragOverIndex.current = index; };
  const handleDragEnd = () => {
    if (dragIndex === null || dragOverIndex.current === null) return;
    const updated = [...blocks];
    const [dragged] = updated.splice(dragIndex, 1);
    updated.splice(dragOverIndex.current, 0, dragged);
    setBlocks(updated);
    setDragIndex(null);
    dragOverIndex.current = null;
  };

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pravila</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Pravila i smjernice za sudjelovanje u ligi</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={saving} className="gap-2">
                  <X className="w-4 h-4" />
                  Odustani
                </Button>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Spremi
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setEditing(true)} className="gap-2">
                <Pencil className="w-4 h-4" />
                Uredi pravila
              </Button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <SkeletonBlock />
          <SkeletonBlock />
          <SkeletonBlock />
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, index) => (
            <Card
              key={block.id}
              draggable={editing}
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`shadow-sm py-0 transition-all duration-150 ${dragIndex === index ? "opacity-40 scale-[0.99]" : ""} ${editing ? "cursor-grab active:cursor-grabbing" : ""}`}
            >
              {/* Top accent line */}
              <div className="h-0.5 rounded-t-[inherit]" style={{ background: "oklch(0.448 0.119 150)" }} />
              <CardContent className="p-5">
                {editing ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        placeholder="Naslov"
                        value={block.title}
                        onChange={(e) => handleUpdate(block.id, "title", e.target.value)}
                        className="flex-1"
                      />
                      <button
                        onClick={() => handleDelete(block.id)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                        title="Obriši odjeljak"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <Textarea
                      placeholder="Unesite tekst... **podebljano**, - lista, itd."
                      value={block.content}
                      onChange={(e) => handleUpdate(block.id, "content", e.target.value)}
                      rows={4}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Podržava Markdown formatiranje</p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-base font-bold text-primary mb-2">{block.title}</h2>
                    <Separator className="mb-3" />
                    <div className="prose prose-sm max-w-none text-foreground
                      [&_p]:mb-2 [&_p]:leading-relaxed
                      [&_ul]:pl-4 [&_ul]:mb-2 [&_ol]:pl-4 [&_ol]:mb-2
                      [&_li]:mb-1 [&_li]:leading-relaxed
                      [&_strong]:font-semibold
                      [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-semibold">
                      <ReactMarkdown>{block.content}</ReactMarkdown>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}

          {editing && (
            <button
              onClick={handleAddBlock}
              className="w-full py-4 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Dodaj novi odjeljak
            </button>
          )}

          {blocks.length === 0 && !editing && (
            <EmptyState
              icon={BookOpen}
              title="Nema pravila"
              description={isAdmin ? "Klikni 'Uredi pravila' za dodavanje prvog odjeljka." : "Pravila još nisu dodana. Provjerite ponovo kasnije."}
            />
          )}
        </div>
      )}
    </div>
  );
}
