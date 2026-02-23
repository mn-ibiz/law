"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { clientUploadDocument } from "@/lib/actions/documents";
import { useRouter } from "next/navigation";

export function DocumentUploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("other");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    const result = await clientUploadDocument({
      title,
      category,
      description: description || undefined,
      fileUrl,
      fileName,
    });

    if (result && "error" in result) {
      setMessage(result.error as string);
    } else {
      setMessage("Document uploaded for review");
      setTitle("");
      setCategory("other");
      setDescription("");
      setFileUrl("");
      setFileName("");
      router.refresh();
    }
    setSubmitting(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Document
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Document Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="correspondence">Correspondence</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="evidence">Evidence</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileUrl">File URL</Label>
            <Input id="fileUrl" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileName">File Name</Label>
            <Input id="fileName" value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="document.pdf" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>

          {message && <p className="text-sm text-muted-foreground">{message}</p>}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Uploading..." : "Upload for Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
