"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function CreateQuestion({
  matchId,
  onCreated,
}: {
  matchId: string;
  onCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [type, setType] = useState("yes_no");
  const [customOptions, setCustomOptions] = useState("");
  const [weight, setWeight] = useState("500");
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreate() {
    let options: string[];
    if (type === "yes_no") {
      options = ["Yes", "No"];
    } else {
      options = customOptions
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);
      if (options.length < 2) {
        toast.error("Need at least 2 options (comma-separated)");
        return;
      }
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          text,
          type,
          options,
          weight: parseInt(weight),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to create question");
        return;
      }

      toast.success("Question created!");
      setOpen(false);
      setText("");
      setCustomOptions("");
      onCreated?.();
    } catch {
      toast.error("Network error");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          <Plus className="h-4 w-4" />
          Create Question
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Custom Question</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Question</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., Will Kohli hit a half-century?"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes_no">Yes / No</SelectItem>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Points Weight</Label>
              <Select value={weight} onValueChange={setWeight}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="250">Easy (250)</SelectItem>
                  <SelectItem value="500">Medium (500)</SelectItem>
                  <SelectItem value="750">Hard (750)</SelectItem>
                  <SelectItem value="1000">Expert (1000)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {type === "multiple_choice" && (
            <div>
              <Label>Options (comma-separated)</Label>
              <Input
                value={customOptions}
                onChange={(e) => setCustomOptions(e.target.value)}
                placeholder="e.g., Kohli, Rohit, Jadeja, Someone else"
                className="mt-1"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !text}>
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
