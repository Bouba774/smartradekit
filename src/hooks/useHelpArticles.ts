import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface HelpArticleTranslation {
  category: string;
  question: string;
  answer: string;
}

interface HelpArticle {
  id: string;
  category_key: string;
  category_icon: string;
  category_order: number;
  question_key: string;
  question_order: number;
  translations: Record<string, HelpArticleTranslation>;
}

interface ProcessedCategory {
  key: string;
  name: string;
  icon: string;
  order: number;
  articles: {
    id: string;
    question: string;
    answer: string;
    order: number;
  }[];
}

export function useHelpArticles() {
  const { language } = useLanguage();

  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['help-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_articles')
        .select('*')
        .eq('is_active', true)
        .order('category_order', { ascending: true })
        .order('question_order', { ascending: true });

      if (error) throw error;
      return data as unknown as HelpArticle[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });

  // Process articles into categories
  const categories: ProcessedCategory[] = [];
  
  if (articles) {
    const categoryMap = new Map<string, ProcessedCategory>();
    
    for (const article of articles) {
      const translation = article.translations[language] || article.translations['fr'] || article.translations['en'];
      
      if (!translation) continue;
      
      if (!categoryMap.has(article.category_key)) {
        categoryMap.set(article.category_key, {
          key: article.category_key,
          name: translation.category,
          icon: article.category_icon,
          order: article.category_order,
          articles: [],
        });
      }
      
      const category = categoryMap.get(article.category_key)!;
      category.articles.push({
        id: article.id,
        question: translation.question,
        answer: translation.answer,
        order: article.question_order,
      });
    }
    
    // Sort and convert to array
    categories.push(
      ...Array.from(categoryMap.values()).sort((a, b) => a.order - b.order)
    );
  }

  return {
    categories,
    isLoading,
    error,
  };
}
