import { useState } from "react";
import { Link } from "wouter";
import UserLayout from "@/components/UserLayout";
import {
  useListBlogs,
  useListBlogCategories,
  useToggleBlogLike,
  getListBlogsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, MessageCircle, Plus, Calendar, User, Filter } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function BlogsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: blogs, isLoading } = useListBlogs({
    category: selectedCategory === "all" ? undefined : selectedCategory,
  });
  const { data: categories } = useListBlogCategories();
  const toggleLikeMutation = useToggleBlogLike();

  const handleLike = async (blogId: string) => {
    try {
      await toggleLikeMutation.mutateAsync({ id: blogId });
      queryClient.invalidateQueries({ queryKey: getListBlogsQueryKey() });
    } catch (error) {
      toast({ title: "Failed to toggle like", variant: "destructive" });
    }
  };

  const isLiked = (blog: any) => {
    return blog.likes?.includes(user?.id);
  };

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Community Blog</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Share and discuss health topics with the community</p>
          </div>
          <Link href="/blogs/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Write Blog
            </Button>
          </Link>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter by category:</span>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (blogs ?? []).length === 0 ? (
          <div className="text-center py-16 bg-card border rounded-xl">
            <MessageCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No blog posts yet</p>
            <Link href="/blogs/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Write the first blog post
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {(blogs ?? []).map((blog) => (
              <Card key={blog.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/blogs/${blog.id}`}>
                        <CardTitle className="text-lg hover:text-primary cursor-pointer">
                          {blog.title}
                        </CardTitle>
                      </Link>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{blog.category}</Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          {blog.authorName}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{blog.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(blog.id)}
                        disabled={toggleLikeMutation.isPending}
                        className={`flex items-center gap-1 ${
                          isLiked(blog) ? "text-red-500" : "text-muted-foreground"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked(blog) ? "fill-current" : ""}`} />
                        {blog.likes?.length || 0}
                      </Button>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MessageCircle className="w-4 h-4" />
                        {blog.comments?.length || 0}
                      </div>
                    </div>
                    <Link href={`/blogs/${blog.id}`}>
                      <Button variant="outline" size="sm">
                        Read More
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}