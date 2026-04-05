import { useState } from "react";
import { useLocation } from "wouter";
import UserLayout from "@/components/UserLayout";
import { useCreateBlog, useListBlogCategories } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Send, ArrowLeft } from "lucide-react";

export default function CreateBlogPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreateBlog();
  const { data: categories } = useListBlogCategories();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    content: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.description) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    try {
      await createMutation.mutateAsync({
        data: formData,
      });

      toast({ title: "Blog post created successfully" });
      setLocation("/blogs");
    } catch (error) {
      toast({ title: "Failed to create blog post", variant: "destructive" });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/blogs")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blogs
          </Button>
          <h1 className="text-xl font-bold">Create Blog Post</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Share your thoughts and experiences with the community</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              New Blog Post
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter blog title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                      <SelectItem value="General Health">General Health</SelectItem>
                      <SelectItem value="Mental Health">Mental Health</SelectItem>
                      <SelectItem value="Nutrition">Nutrition</SelectItem>
                      <SelectItem value="Fitness">Fitness</SelectItem>
                      <SelectItem value="Disease Prevention">Disease Prevention</SelectItem>
                      <SelectItem value="Healthcare Tips">Healthcare Tips</SelectItem>
                      <SelectItem value="Personal Stories">Personal Stories</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Brief summary of your blog post (will be shown in the blog list)"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Full Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your full blog post content here (optional)"
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  rows={10}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/blogs")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1"
                >
                  {createMutation.isPending ? (
                    "Publishing..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Publish Blog
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}