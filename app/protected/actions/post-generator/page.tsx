"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Save } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

const postTypes = [
  { id: 'engagement', label: 'פוסט מעורבות' },
  { id: 'promotional', label: 'פוסט קידום מכירות' },
  { id: 'educational', label: 'פוסט חינוכי' },
  { id: 'storytelling', label: 'פוסט סיפורי' },
];

export default function PostGeneratorPage() {
  const [postType, setPostType] = useState('engagement');
  const [keywords, setKeywords] = useState('');
  const [generatedPosts, setGeneratedPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('הועתק ללוח');
  };

  const savePost = async (post: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('יש להתחבר כדי לשמור פוסטים');
        return;
      }

      const { error } = await supabase
        .from('saved_posts')
        .insert([
          { 
            user_id: user.id,
            content: post,
            post_type: postType,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      
      toast.success('הפוסט נשמר בהצלחה');
    } catch (err) {
      console.error('Error saving post:', err);
      toast.error('שגיאה בשמירת הפוסט');
    }
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
      
      <div className="bg-card rounded-lg p-6 border mb-8">
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

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      {generatedPosts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">הפוסטים שנוצרו</h2>
          
          {generatedPosts.map((post, index) => (
            <div key={index} className="bg-card rounded-lg p-6 border relative">
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
                  onClick={() => savePost(post)}
                >
                  <Save size={16} className="ml-2" />
                  שמור
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 