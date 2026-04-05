import { useState } from "react";
import { useLocation, useParams } from "wouter";
import UserLayout from "@/components/UserLayout";
import {
  useGetBlog,
  useToggleBlogLike,
  useCreateBlogComment,
  useDeleteBlogComment,
  getGetBlogQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Heart, MessageCircle, ArrowLeft, Calendar, User, Trash2, Send } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function BlogDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

  if (!id) {
    return (
      <UserLayout>
        <div className="max-w-4xl mx-auto p-6">
          <p>Blog not found</p>
        </div>
      </UserLayout>
    );
  }

  const { data: blog, isLoading } = useGetBlog(id);
  const toggleLikeMutation = useToggleBlogLike();
  const createCommentMutation = useCreateBlogComment();
  const deleteCommentMutation = useDeleteBlogComment();

  const handleLike = async () => {
    if (!blog) return;
    try {
      await toggleLikeMutation.mutateAsync({ id: blog.id });
      queryClient.invalidateQueries({ queryKey: getGetBlogQueryKey(id) });
    } catch (error) {
      toast({ title: "Failed to toggle like", variant: "destructive" });
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !blog) return;

    try {
      await createCommentMutation.mutateAsync({
        id: blog.id,
        data: { content: commentText.trim() },
      });
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: getGetBlogQueryKey(id) });
      toast({ title: "Comment added" });
    } catch (error) {
      toast({ title: "Failed to add comment", variant: "destructive" });
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteCommentId || !blog) return;

    try {
      await deleteCommentMutation.mutateAsync({
        id: blog.id,
        commentId: deleteCommentId,
      });
      queryClient.invalidateQueries({ queryKey: getGetBlogQueryKey(id) });
      toast({ title: "Comment deleted" });
    } catch (error) {
      toast({ title: "Failed to delete comment", variant: "destructive" });
    }
    setDeleteCommentId(null);
  };

  const isLiked = blog?.likes?.includes(user!.id!.toString());
  const isAuthor = blog?.author === user!.id!.toString();
  const isAdmin = user?.role === "admin";

  if (isLoading) {
    return (
      <UserLayout>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (!blog) {
    return (
      <UserLayout>
        <div className="max-w-4xl mx-auto text-center py-16">
          <p className="text-muted-foreground">Blog post not found</p>
          <Button onClick={() => setLocation("/blogs")} className="mt-4">
            Back to Blogs
          </Button>
        </div>
      </UserLayout>
    );
  }

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
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{blog.title}</CardTitle>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Badge variant="secondary">{blog.category}</Badge>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {blog.authorName}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none mb-6">
              <p className="text-lg text-muted-foreground mb-4">{blog.description}</p>
              {blog.content && (
                <div className="whitespace-pre-wrap">{blog.content}</div>
              )}
            </div>

            <div className="flex items-center gap-4 pt-4 border-t">
              <Button
                variant="ghost"
                onClick={handleLike}
                disabled={toggleLikeMutation.isPending}
                className={`flex items-center gap-2 ${
                  isLiked ? "text-red-500" : "text-muted-foreground"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                {blog.likes?.length || 0} Likes
              </Button>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="w-5 h-5" />
                {blog.comments?.length || 0} Comments
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Comments ({blog.comments?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Comment Form */}
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
              />
              <Button
                type="submit"
                disabled={!commentText.trim() || createCommentMutation.isPending}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
              </Button>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {blog.comments?.map((comment) => (
                <div key={comment._id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{comment.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{comment.content}</p>
                    </div>
                    {(comment.userId === user?.id?.toString() || isAdmin) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteCommentId(comment._id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {(!blog.comments || blog.comments.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete Comment Dialog */}
        <Dialog open={!!deleteCommentId} onOpenChange={() => setDeleteCommentId(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Comment</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteCommentId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteComment}
                disabled={deleteCommentMutation.isPending}
              >
                {deleteCommentMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </UserLayout>
  );
}