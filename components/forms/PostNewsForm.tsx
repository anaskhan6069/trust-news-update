"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ImagePlus, Video } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toaster";
import { categories } from "@/constants";
import { isCategorySlug } from "@/lib/utils";

const postNewsSchema = z.object({
  title: z.string().min(10, "News title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  category: z.string().refine(isCategorySlug, "Select a valid category"),
  authorName: z.string().min(2, "Your name is required"),
  authorEmail: z.string().email("A valid email is required")
});

type PostNewsValues = z.infer<typeof postNewsSchema>;

interface PostNewsFormProps {
  userName: string;
  userEmail: string;
}

interface UploadImageResponse {
  success: boolean;
  url?: string;
  message?: string;
}

interface UploadVideoResponse {
  success: boolean;
  embedUrl?: string;
  message?: string;
}

interface SaveDraftResponse {
  success: boolean;
  message: string;
}

const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024;
const VIDEO_SIZE_LIMIT = 100 * 1024 * 1024;

function validateImageFile(file: File | null): string | null {
  const schema = z
    .instanceof(File, { message: "Image is required" })
    .refine((value) => value.type.startsWith("image/"), "Only image files are allowed")
    .refine((value) => value.size <= IMAGE_SIZE_LIMIT, "Image must be 5MB or smaller");

  const result = schema.safeParse(file);
  return result.success ? null : result.error.issues[0]?.message ?? "Invalid image";
}

function validateVideoFile(file: File | null): string | null {
  if (!file) {
    return null;
  }

  const schema = z
    .instanceof(File)
    .refine((value) => value.type.startsWith("video/"), "Only video files are allowed")
    .refine((value) => value.size <= VIDEO_SIZE_LIMIT, "Video must be 100MB or smaller");

  const result = schema.safeParse(file);
  return result.success ? null : result.error.issues[0]?.message ?? "Invalid video";
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload/image", {
    method: "POST",
    body: formData
  });
  const data = (await response.json()) as UploadImageResponse;

  if (!response.ok || !data.success || !data.url) {
    throw new Error(data.message ?? "Image upload failed");
  }

  return data.url;
}

async function uploadVideo(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload/video", {
    method: "POST",
    body: formData
  });
  const data = (await response.json()) as UploadVideoResponse;

  if (!response.ok || !data.success || !data.embedUrl) {
    throw new Error(data.message ?? "Video upload failed");
  }

  return data.embedUrl;
}

export function PostNewsForm({ userName, userEmail }: PostNewsFormProps): JSX.Element {
  const router = useRouter();
  const { toast } = useToast();
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string>("");
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<string>("");

  const form = useForm<PostNewsValues>({
    resolver: zodResolver(postNewsSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "technology",
      authorName: userName,
      authorEmail: userEmail
    }
  });

  React.useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  async function onSubmit(values: PostNewsValues): Promise<void> {
    setFileError(null);
    const imageValidationError = validateImageFile(imageFile);
    const videoValidationError = validateVideoFile(videoFile);

    if (imageValidationError || videoValidationError) {
      setFileError(imageValidationError ?? videoValidationError);
      return;
    }

    if (!imageFile) {
      setFileError("Image is required");
      return;
    }

    try {
      setStep("Uploading image");
      const imageUrl = await uploadImage(imageFile);
      let videoUrl = "";

      if (videoFile) {
        setStep("Uploading video");
        videoUrl = await uploadVideo(videoFile);
      }

      setStep("Saving draft");
      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          category: values.category,
          imageUrl,
          videoUrl,
          authorName: values.authorName,
          authorEmail: values.authorEmail
        })
      });
      const data = (await response.json()) as SaveDraftResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save draft");
      }

      toast({
        title: "✅ News saved in draft. Waiting for admin approval.",
        description: "You will be redirected to the homepage shortly.",
        variant: "success"
      });
      form.reset({
        title: "",
        description: "",
        category: "technology",
        authorName: userName,
        authorEmail: userEmail
      });
      setImageFile(null);
      setVideoFile(null);
      window.setTimeout(() => router.push("/"), 3000);
    } catch (error) {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Unable to submit news.",
        variant: "error"
      });
    } finally {
      setStep("");
    }
  }

  const isSubmitting = form.formState.isSubmitting || Boolean(step);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post News</CardTitle>
        <CardDescription>Your submission will be reviewed before it appears on Trust News.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="title">News Title</Label>
            <Input id="title" {...form.register("title")} />
            {form.formState.errors.title ? <p className="text-sm text-red-600">{form.formState.errors.title.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register("description")} />
            {form.formState.errors.description ? (
              <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Controller
              name="category"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.slug} value={category.slug}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.category ? (
              <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
            ) : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="image">Image Upload</Label>
              <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-secondary/35 p-4 text-center transition-colors hover:bg-secondary">
                <ImagePlus className="h-8 w-8 text-muted-foreground" />
                <span className="mt-2 text-sm font-semibold">Choose image</span>
                <span className="mt-1 text-xs text-muted-foreground">image/*, max 5MB</span>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    setImageFile(event.target.files?.[0] ?? null);
                    setFileError(null);
                  }}
                />
              </label>
              {imagePreview ? (
                <div className="relative aspect-video overflow-hidden rounded-lg border">
                  <Image src={imagePreview} alt="Selected image preview" fill className="object-cover" />
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="video">Video Upload</Label>
              <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-secondary/35 p-4 text-center transition-colors hover:bg-secondary">
                <Video className="h-8 w-8 text-muted-foreground" />
                <span className="mt-2 text-sm font-semibold">Choose video</span>
                <span className="mt-1 text-xs text-muted-foreground">video/*, max 100MB</span>
                <Input
                  id="video"
                  type="file"
                  accept="video/*"
                  className="sr-only"
                  onChange={(event) => {
                    setVideoFile(event.target.files?.[0] ?? null);
                    setFileError(null);
                  }}
                />
              </label>
              {videoFile ? <p className="rounded-md bg-secondary p-3 text-sm font-medium">{videoFile.name}</p> : null}
            </div>
          </div>

          {fileError ? <p className="text-sm text-red-600">{fileError}</p> : null}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="authorName">Your Name</Label>
              <Input id="authorName" {...form.register("authorName")} />
              {form.formState.errors.authorName ? (
                <p className="text-sm text-red-600">{form.formState.errors.authorName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="authorEmail">Your Email</Label>
              <Input id="authorEmail" type="email" {...form.register("authorEmail")} />
              {form.formState.errors.authorEmail ? (
                <p className="text-sm text-red-600">{form.formState.errors.authorEmail.message}</p>
              ) : null}
            </div>
          </div>

          <Button size="lg" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : null}
            {step || "Submit for Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
