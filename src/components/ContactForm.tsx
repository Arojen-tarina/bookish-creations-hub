import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Nimi on pakollinen" })
    .max(100, { message: "Nimi saa olla enintään 100 merkkiä" }),
  email: z
    .string()
    .trim()
    .email({ message: "Virheellinen sähköpostiosoite" })
    .max(255, { message: "Sähköposti saa olla enintään 255 merkkiä" }),
  message: z
    .string()
    .trim()
    .min(1, { message: "Viesti on pakollinen" })
    .max(2000, { message: "Viesti saa olla enintään 2000 merkkiä" }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);

    try {
      const { data: response, error } = await supabase.functions.invoke(
        "send-contact-email",
        {
          body: data,
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Viesti lähetetty!",
        description: "Kiitos yhteydenotostasi. Palaamme asiaan pian.",
      });

      form.reset();
    } catch (error: any) {
      console.error("Error sending contact form:", error);
      toast({
        title: "Virhe",
        description: "Viestin lähetys epäonnistui. Yritä uudelleen myöhemmin.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl text-foreground flex items-center gap-2">
          <Send className="h-6 w-6 text-primary" />
          Lähetä viesti
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nimi</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nimesi"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sähköposti</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="sahkoposti@esimerkki.fi"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Viesti</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Kirjoita viestisi tähän..."
                      className="min-h-[150px] resize-none"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Lähetetään...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Lähetä viesti
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
