import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Clock, Building2, Lightbulb } from 'lucide-react';

interface Suggestion {
  room: string;
  time: string;
  reason: string;
}

const AISuggest = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getSuggestions = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-suggest', {
        body: { query: query.trim() }
      });
      if (error) throw error;
      setSuggestions(data?.suggestions || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Could not get suggestions', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-display font-bold">AI Room Assistant</h1>
          <p className="text-muted-foreground mt-1">Get smart slot recommendations powered by AI</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What do you need?</CardTitle>
            <CardDescription>Describe your requirements and I'll suggest the best options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="e.g., I need a quiet room for 10 people tomorrow afternoon for a study group..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
            />
            <Button className="w-full bg-accent hover:bg-accent/90" onClick={getSuggestions} disabled={isLoading || !query.trim()}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Get AI Suggestions
            </Button>
          </CardContent>
        </Card>

        {suggestions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-semibold flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-warning" /> Recommendations
            </h2>
            {suggestions.map((s, i) => (
              <Card key={i} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Badge className="bg-accent/10 text-accent">#{i + 1}</Badge>
                    <div className="flex-1">
                      <h3 className="font-semibold flex items-center gap-2"><Building2 className="w-4 h-4" />{s.room}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1"><Clock className="w-4 h-4" />{s.time}</p>
                      <p className="mt-3 text-sm">{s.reason}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AISuggest;
