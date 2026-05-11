import { Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import heroImage from "@/assets/blog-grass-hero.jpg";

const posts = [
  {
    slug: "types-of-grass-in-australia",
    title: "Australian Lawn Guide: Common Grass Types & How to Care for Them",
    excerpt:
      "From Sir Walter Buffalo to Couch and Kikuyu, learn which grass suits your Sydney garden and how to keep it lush all year round.",
    date: "2026-05-11",
    readTime: "8 min read",
    image: heroImage,
  },
];

const Blog = () => {
  useEffect(() => {
    document.title = "Blog | TaskTroopers Garden & Building Maintenance Sydney";
    const desc = "Practical garden and lawn care tips from Sydney's Lower North Shore and Northern Beaches maintenance specialists.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              The <span className="bg-gradient-primary bg-clip-text text-transparent">TaskTroopers</span> Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Practical advice on lawns, gardens and property maintenance — straight from our team on Sydney's Lower North Shore and Northern Beaches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`} className="group">
                <Card className="overflow-hidden h-full bg-card border-border hover:border-primary/60 transition-colors shadow-lg">
                  <div className="aspect-[16/9] overflow-hidden bg-muted">
                    <img
                      src={post.image}
                      alt={post.title}
                      width={1536}
                      height={896}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardHeader>
                    <div className="text-xs text-muted-foreground mb-2">
                      {new Date(post.date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })} · {post.readTime}
                    </div>
                    <CardTitle className="text-2xl text-foreground group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription>{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-primary font-medium">Read article →</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;