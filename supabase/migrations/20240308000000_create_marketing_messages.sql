-- Create marketing_messages table
CREATE TABLE IF NOT EXISTS public.marketing_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience_id UUID REFERENCES public.target_audiences(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.marketing_messages ENABLE ROW LEVEL SECURITY;

-- Policy for users to select their own marketing messages
CREATE POLICY "Users can view their own marketing messages"
  ON public.marketing_messages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own marketing messages
CREATE POLICY "Users can insert their own marketing messages"
  ON public.marketing_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own marketing messages
CREATE POLICY "Users can update their own marketing messages"
  ON public.marketing_messages
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for users to delete their own marketing messages
CREATE POLICY "Users can delete their own marketing messages"
  ON public.marketing_messages
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update updated_at timestamp
CREATE TRIGGER set_marketing_messages_updated_at
BEFORE UPDATE ON public.marketing_messages
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at(); 