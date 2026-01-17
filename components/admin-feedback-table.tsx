"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { getCategoryDesign } from "@/app/data/category-data";
import { Badge } from "./ui/badge";
import { Edit, Save, ThumbsUp, User, X } from "lucide-react";
import { STATUS_GROUPS, STATUS_ORDER } from "@/app/data/status-data";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function AdminFeedbackTable({ posts }: { posts: any[] }) {
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [postStatus, setPostStatus] = useState<Record<number, string>>(
    Object.fromEntries(posts.map((post) => [post.id, post.status])),
  );
  const [originalStatus, setOriginalStatus] = useState<Record<number, string>>(
    {},
  );

  const handleStatusChange = (postId: number, newStatus: string) => {
    setPostStatus((prev) => ({
      ...prev,
      [postId]: newStatus,
    }));
  };

  const startEditing = (postId: number) => {
    setOriginalStatus((prev) => ({
      ...prev,
      [postId]: originalStatus[postId],
    }));
    setEditingPostId(postId);
  };
  const cancelEditing = (postId: number) => {
    if (originalStatus[postId]) {
      setPostStatus((prev) => ({
        ...prev,
        [postId]: originalStatus[postId],
      }));
    }
    setEditingPostId(null);
  };

  const saveStatus = async (postId: number) => {
    // Show loading toast
    const loadingToast = toast.loading("Saving status...");
    try {
      const response = await fetch(`/api/feedback/${postId}/status`, {
        method: "PATCH",
        headers: {
          "Contect-Type": "application/json",
        },
        body: JSON.stringify({ status: postStatus[postId] }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Dismiss the loading toast
      toast.dismiss(loadingToast);
      toast.success("Feedback status updated successfully!");
      setEditingPostId(null);
    } catch (error) {
      console.error("Failed to update status: ", error);
      toast.dismiss(loadingToast);
      toast.error("failed to update feedback status, Please try again.");
    }
  };

  const getStatusIcon = (status: string) => {
    const statusGroup = STATUS_GROUPS[status as keyof typeof STATUS_GROUPS];
    if (!statusGroup) return null;
    const Icon = statusGroup.icon;
    return <Icon className="h-3 w-3 mr-1" />;
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Votes</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => {
              const isEditing = editingPostId === post.id;
              const currentStatus = postStatus[post.id];
              const categoryDesign = getCategoryDesign(post.category);
              const CategoryIcon = categoryDesign.icon;

              return (
                <TableRow key={post.id} className="h-[70px]">
                  <TableCell className="font-medium max-w-xs truncate align-middle">
                    {post.title}
                  </TableCell>
                  <TableCell className="align-middle">
                    <Badge
                      variant="outline"
                      className={`${categoryDesign.border} ${categoryDesign.text}`}
                    >
                      <CategoryIcon className="h-3 w-3" />
                      {post.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-middle">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-3 w-3" />
                      {post.votes.length}
                    </div>
                  </TableCell>
                  <TableCell className="align-middle">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span className="truncate max-w-[100px]">
                        {post.author.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="align-middle">
                    {isEditing ? (
                      <>
                        <Select
                          value={currentStatus}
                          onValueChange={(value) =>
                            handleStatusChange(post.id, value)
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue>
                              <div className="flex items-center">
                                {getStatusIcon(currentStatus)}
                                {
                                  STATUS_GROUPS[
                                    currentStatus as keyof typeof STATUS_GROUPS
                                  ]?.title
                                }
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_ORDER.map((status) => {
                              const statusGroup =
                                STATUS_GROUPS[
                                  status as keyof typeof STATUS_GROUPS
                                ];
                              const Icon = statusGroup.icon;
                              return (
                                <SelectItem key={status} value={status}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    {statusGroup.title}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </>
                    ) : (
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-2 ${
                          STATUS_GROUPS[
                            currentStatus as keyof typeof STATUS_GROUPS
                          ]?.countColor
                        }`}
                      >
                        {getStatusIcon(currentStatus)}
                        {
                          STATUS_GROUPS[
                            currentStatus as keyof typeof STATUS_GROUPS
                          ]?.title
                        }
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="align-middle">
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => saveStatus(post.id)}
                          className="gap-1 h-8"
                        >
                          <Save className="h-3 w-3" />
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelEditing(post.id)}
                          className="gap-1 h-8"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditing(post.id)}
                          className="gap-1 h-8"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
