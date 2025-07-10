import { NextResponse } from 'next/server';
import { mockData } from '@/lib/supabase';
import { supabase } from '@/lib/supabase/client';
import { useMockData } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Get the search query from URL
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    
    // Return early if query is too short
    if (query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }
    
    let suggestions: string[] = [];
    
    if (useMockData()) {
      // Use mock data for suggestions
      // Filter course titles from mock data that match the query
      suggestions = mockData.mockCourses
        .filter(course => 
          course.title.toLowerCase().includes(query.toLowerCase())
        )
        .map(course => course.title);
    } else {
      // Get real suggestions from Supabase
      const { data, error } = await supabase
        .from('courses')
        .select('title')
        .ilike('title', `%${query}%`)
        .limit(5);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        suggestions = data.map(item => item.title);
      }
    }
    
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search suggestions' },
      { status: 500 }
    );
  }
} 