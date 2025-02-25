"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Save, Image, RefreshCw, Eye, Download } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const postTypes = [
  { id: 'engagement', label: 'פוסט מעורבות' },
  { id: 'promotional', label: 'פוסט קידום מכירות' },
  { id: 'educational', label: 'פוסט חינוכי' },
  { id: 'storytelling', label: 'פוסט סיפורי' },
];

const imageSizes = [
  { id: '1024x1024', label: 'ריבוע (1024x1024)' },
  { id: '1024x1792', label: 'לאורך (1024x1792)' },
  { id: '1792x1024', label: 'לרוחב (1792x1024)' },
];

interface GeneratedImage {
  id: string | null;
  url: string;
  prompt: string;
}

export default function PostGeneratorPage() {
  const [postType, setPostType] = useState('engagement');
  const [keywords, setKeywords] = useState('');
  const [generatedPosts, setGeneratedPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Image generation states
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSize, setImageSize] = useState('1024x1024');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<Record<number, GeneratedImage>>({});
  
  const supabase = createClient();

  const generatePosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/actions/post-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postType,
          keywords: keywords.trim() ? keywords : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate posts');
      }

      const data = await response.json();
      setGeneratedPosts(data.posts);
      
      // Auto-generate image prompt based on first post if no images yet
      if (data.posts.length > 0 && generatedImages.length === 0 && !imagePrompt) {
        const firstPost = data.posts[0];
        // Extract first line as title
        const title = firstPost.split('\n')[0].replace('כותרת: ', '').replace(/"/g, '');
        setImagePrompt(`Create a social media image for: ${title}`);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async () => {
    try {
      setImageLoading(true);
      setImageError(null);

      const response = await fetch('/api/actions/image-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          size: imageSize,
          n: 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      setGeneratedImages(prev => [...prev, ...data.images]);
      
      toast.success('התמונה נוצרה בהצלחה');
    } catch (err) {
      console.error('Error:', err);
      setImageError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('שגיאה ביצירת התמונה');
    } finally {
      setImageLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('הועתק ללוח');
  };

  const savePost = async (post: string, postIndex: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('יש להתחבר כדי לשמור פוסטים');
        return;
      }

      // Save the post
      const { data: postData, error: postError } = await supabase
        .from('saved_posts')
        .insert([
          { 
            user_id: user.id,
            content: post,
            post_type: postType,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (postError) throw postError;
      
      // If there's a selected image for this post, associate it
      const selectedImage = selectedImages[postIndex];
      if (selectedImage && selectedImage.id && postData && postData.length > 0) {
        const { error: associationError } = await supabase
          .from('post_image_associations')
          .insert([
            {
              post_id: postData[0].id,
              image_id: selectedImage.id,
              created_at: new Date().toISOString()
            }
          ]);
          
        if (associationError) {
          console.error('Error associating image with post:', associationError);
        }
      }
      
      toast.success('הפוסט נשמר בהצלחה');
    } catch (err) {
      console.error('Error saving post:', err);
      toast.error('שגיאה בשמירת הפוסט');
    }
  };

  const selectImageForPost = (postIndex: number, image: GeneratedImage) => {
    setSelectedImages(prev => ({
      ...prev,
      [postIndex]: image
    }));
    toast.success('התמונה נבחרה לפוסט');
  };

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">יוצר הפוסטים החכם</h1>
        <Link 
          href="/protected"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          חזרה ללוח הבקרה
        </Link>
      </div>
      
      <Tabs defaultValue="posts" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posts">יצירת פוסטים</TabsTrigger>
          <TabsTrigger value="images">יצירת תמונות</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="mt-4">
          <div className="bg-card rounded-lg p-6 border">
            <div className="space-y-6">
              <div>
                <Label htmlFor="post-type">סוג הפוסט</Label>
                <RadioGroup 
                  value={postType} 
                  onValueChange={setPostType}
                  className="flex flex-wrap gap-4 mt-2"
                >
                  {postTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value={type.id} id={type.id} />
                      <Label htmlFor={type.id}>{type.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div>
                <Label htmlFor="keywords">מילות מפתח (לא חובה)</Label>
                <Input
                  id="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="הפרד מילות מפתח בפסיקים"
                  className="mt-1"
                />
              </div>
              
              <Button 
                onClick={generatePosts}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'מייצר פוסטים...' : 'צור פוסטים'}
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="images" className="mt-4">
          <div className="bg-card rounded-lg p-6 border">
            <div className="space-y-6">
              <div>
                <Label htmlFor="image-prompt">תיאור התמונה</Label>
                <Textarea
                  id="image-prompt"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="תאר את התמונה שברצונך ליצור"
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="image-size">גודל התמונה</Label>
                <RadioGroup 
                  value={imageSize} 
                  onValueChange={setImageSize}
                  className="flex flex-wrap gap-4 mt-2"
                >
                  {imageSizes.map((size) => (
                    <div key={size.id} className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value={size.id} id={size.id} />
                      <Label htmlFor={size.id}>{size.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <Button 
                onClick={generateImage}
                disabled={imageLoading || !imagePrompt.trim()}
                className="w-full"
              >
                {imageLoading ? 'מייצר תמונה...' : 'צור תמונה'}
              </Button>
            </div>
          </div>
          
          {imageError && (
            <div className="text-red-500 mt-4">{imageError}</div>
          )}
          
          {generatedImages.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">התמונות שנוצרו</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generatedImages.map((image, index) => (
                  <div key={index} className="bg-card rounded-lg overflow-hidden border shadow-sm">
                    <div className="relative aspect-square bg-muted overflow-hidden">
                      <img 
                        src={image.url} 
                        alt={`Generated image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                        onError={(e) => {
                          console.error("Image failed to load:", image.url);
                          e.currentTarget.src = "/placeholder-image.jpg"; // Add a placeholder image
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{image.prompt}</p>
                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(image.url, '_blank')}
                        >
                          <Eye size={16} className="mr-2" />
                          מסך מלא
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = image.url;
                            link.download = `image-${index}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <Download size={16} className="mr-2" />
                          הורד
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      {generatedPosts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">הפוסטים שנוצרו</h2>
          
          {generatedPosts.map((post, index) => (
            <div key={index} className="bg-card rounded-lg p-6 border relative">
              <div className="flex gap-4">
                {/* Post content */}
                <div className="flex-1">
                  <div className="whitespace-pre-wrap mb-4">{post}</div>
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(post)}
                    >
                      <Copy size={16} className="ml-2" />
                      העתק
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => savePost(post, index)}
                    >
                      <Save size={16} className="ml-2" />
                      שמור
                    </Button>
                  </div>
                </div>
                
                {/* Image selection */}
                {generatedImages.length > 0 && (
                  <div className="w-1/3 border-r pr-4">
                    {selectedImages[index] ? (
                      <div className="relative">
                        <img 
                          src={selectedImages[index].url} 
                          alt="Selected image"
                          className="w-full h-auto rounded-md"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2 bg-background/80"
                          onClick={() => setSelectedImages(prev => {
                            const newState = {...prev};
                            delete newState[index];
                            return newState;
                          })}
                        >
                          <RefreshCw size={14} />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm mb-2">בחר תמונה לפוסט זה:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {generatedImages.slice(0, 4).map((image, imgIndex) => (
                            <img 
                              key={imgIndex}
                              src={image.url} 
                              alt={`Image option ${imgIndex + 1}`}
                              className="w-full h-auto rounded-md cursor-pointer border hover:border-primary transition-colors"
                              onClick={() => selectImageForPost(index, image)}
                            />
                          ))}
                        </div>
                        {generatedImages.length > 4 && (
                          <p className="text-xs text-center mt-2 text-muted-foreground">
                            + {generatedImages.length - 4} תמונות נוספות
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 