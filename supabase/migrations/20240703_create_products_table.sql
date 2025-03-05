-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    difficulties TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select only their own products
CREATE POLICY "Users can view their own products" 
ON public.products 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy to allow users to insert their own products
CREATE POLICY "Users can insert their own products" 
ON public.products 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own products
CREATE POLICY "Users can update their own products" 
ON public.products 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy to allow users to delete their own products
CREATE POLICY "Users can delete their own products" 
ON public.products 
FOR DELETE 
USING (auth.uid() = user_id); 