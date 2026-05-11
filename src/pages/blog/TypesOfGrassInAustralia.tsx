import { Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import heroImage from "@/assets/blog-grass-hero.jpg";
import buffaloImg from "@/assets/grass-buffalo.jpg";
import couchImg from "@/assets/grass-couch.jpg";
import kikuyuImg from "@/assets/grass-kikuyu.jpg";
import zoysiaImg from "@/assets/grass-zoysia.jpg";
import fescueImg from "@/assets/grass-fescue.jpg";

const GrassImage = ({ src, alt, caption }: { src: string; alt: string; caption: string }) => (
  <figure className="my-6">
    <div className="aspect-[4/3] overflow-hidden rounded-xl shadow-lg">
      <img src={src} alt={alt} width={1024} height={768} loading="lazy" className="w-full h-full object-cover" />
    </div>
    <figcaption className="text-sm text-muted-foreground mt-2 italic">{caption}</figcaption>
  </figure>
);

const TypesOfGrassInAustralia = () => {
  useEffect(() => {
    document.title = "Australian Lawn Guide: Grass Types & Care Tips | TaskTroopers";
    const desc = "A practical Sydney guide to the most common Australian lawn grasses — Buffalo, Couch, Kikuyu, Zoysia and Fescue — and how to keep yours healthy.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);

    // JSON-LD Article schema
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Australian Lawn Guide: Common Grass Types & How to Care for Them",
      datePublished: "2026-05-11",
      author: { "@type": "Organization", name: "TaskTroopers" },
      publisher: { "@type": "Organization", name: "TaskTroopers" },
      description: desc,
    });
    document.head.appendChild(ld);
    return () => {
      document.head.removeChild(ld);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <article className="container mx-auto px-4 max-w-3xl">
          <Link to="/blog">
            <Button variant="ghost" className="mb-6 -ml-3">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to blog
            </Button>
          </Link>

          <div className="text-sm text-muted-foreground mb-3">
            11 May 2026 · 8 min read · Lawn care
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Australian Lawn Guide: Common Grass Types &amp; How to Care for Them
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            A great-looking Australian lawn starts with a simple question — what kind of grass have you actually got? Choosing the right type, and treating it the way it likes to be treated, will save you a fortune in water, replacement turf and frustration.
          </p>

          <div className="aspect-[16/9] overflow-hidden rounded-xl mb-10 shadow-xl">
            <img
              src={heroImage}
              alt="Healthy green Australian backyard lawn in morning sunlight"
              width={1536}
              height={896}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-foreground/90 leading-relaxed">
            <p>
              At TaskTroopers we look after gardens right across Sydney's Lower North Shore and Northern Beaches, and the single most common lawn question we hear is some version of: <em>"Why doesn't mine look like the one next door?"</em> Nine times out of ten the answer comes back to two things — the grass variety, and how it's being mown, watered and fed.
            </p>
            <p>
              Here's our plain-English rundown of the lawn grasses you'll most often see in Australian backyards, and what each of them needs to thrive.
            </p>

            <h2 className="text-3xl font-bold text-foreground pt-6">A quick word on warm-season vs cool-season grasses</h2>
            <p>
              Most Australian lawns are <strong>warm-season grasses</strong>. They love heat, slow right down through winter, and do their growing from spring through to autumn. Buffalo, Couch, Kikuyu and Zoysia all fall into this group.
            </p>
            <p>
              <strong>Cool-season grasses</strong> like Tall Fescue stay greener through winter but struggle in the peak of a Sydney summer without consistent watering. Knowing which camp your lawn sits in is the foundation of every other decision you make about it.
            </p>

            <h2 className="text-3xl font-bold text-foreground pt-6">1. Buffalo (including Sir Walter)</h2>
            <GrassImage src={buffaloImg} alt="Close-up of soft-leaf Buffalo grass blades" caption="How to spot it: broad, flat leaf blades with rounded tips and a slightly blue-green tint." />
            <p>
              Soft-leaf Buffalo, and especially the Sir Walter variety, has become Australia's go-to family lawn — and for good reason. It's shade tolerant (handling around 4–5 hours of direct sun a day), reasonably drought hardy once established, and gentle enough underfoot for kids and pets.
            </p>
            <p>
              <strong>How to look after it:</strong> mow on a higher setting, around 40–50&nbsp;mm. Cutting Buffalo too short scalps it and lets weeds in. Feed it with a slow-release lawn fertiliser in spring and again in early autumn, and water deeply but less often — a long soak twice a week beats a daily sprinkle.
            </p>

            <h2 className="text-3xl font-bold text-foreground pt-6">2. Couch</h2>
            <GrassImage src={couchImg} alt="Close-up of fine-bladed Couch grass" caption="How to spot it: very fine, narrow, sharply pointed bright green blades — that classic cricket-pitch look." />
            <p>
              Couch is the classic fine-bladed Australian lawn — think backyard cricket pitches and sun-soaked front yards. It loves full sun, recovers quickly from wear, and gives you that crisp, manicured look when it's kept short.
            </p>
            <p>
              <strong>How to look after it:</strong> mow it shorter than Buffalo (15–25&nbsp;mm) and mow often during the warm months. Couch hates shade, so if it's thinning out under a tree, that's why. Dethatch every couple of years to stop it building up a spongy layer that holds moisture against the roots.
            </p>

            <h2 className="text-3xl font-bold text-foreground pt-6">3. Kikuyu</h2>
            <GrassImage src={kikuyuImg} alt="Close-up of Kikuyu grass with visible runners" caption="How to spot it: medium-width apple-green blades with obvious runners (stolons) creeping along the surface." />
            <p>
              Kikuyu is the workhorse — fast growing, tough as nails, and great for big open spaces, sports fields and high-traffic family lawns. It greens up beautifully in spring and bounces back from damage faster than just about anything else.
            </p>
            <p>
              The trade-off is that fast growth: Kikuyu wants mowing roughly every week through summer, and it will happily creep into your garden beds and driveway cracks if you don't edge it. Keep it around 30–40&nbsp;mm, edge regularly, and feed it a couple of times a year to keep the colour up.
            </p>

            <h2 className="text-3xl font-bold text-foreground pt-6">4. Zoysia</h2>
            <GrassImage src={zoysiaImg} alt="Close-up of dense Zoysia grass" caption="How to spot it: very fine, soft, dark green blades packed tightly together — feels like a thick carpet underfoot." />
            <p>
              Zoysia (varieties like Sir Grange and Empire) is the premium, low-maintenance option you'll see on a lot of newer Northern Beaches builds. It's slow growing, dense enough to crowd out most weeds on its own, and uses noticeably less water than Couch or Kikuyu.
            </p>
            <p>
              <strong>How to look after it:</strong> mow at 25–40&nbsp;mm, less often than other warm-season grasses — sometimes only once a fortnight. Light, regular feeding works better than one big hit. The catch is that bare patches take their time to fill back in, so be patient if the dog has had a favourite spot.
            </p>

            <h2 className="text-3xl font-bold text-foreground pt-6">5. Tall Fescue</h2>
            <GrassImage src={fescueImg} alt="Close-up of upright Tall Fescue grass blades" caption="How to spot it: upright, coarse, deep green blades that grow in clumps rather than spreading by runners." />
            <p>
              Fescue is the main cool-season grass you'll see around Sydney, especially in shaded gardens or properties where the owner wants a green lawn through winter. It has a lovely deep colour, but it pays for that with much higher water needs once summer hits.
            </p>
            <p>
              <strong>How to look after it:</strong> keep it longer than warm-season grasses — around 50–70&nbsp;mm — to shade its own roots. Water deeply through the hot months and over-sow any thin patches in autumn rather than spring.
            </p>

            <h2 className="text-3xl font-bold text-foreground pt-6">Year-round lawn care basics</h2>
            <p>
              No matter which grass you've got, the same handful of habits will keep it looking great:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Mow regularly, but never take off more than a third</strong> of the leaf in one cut. Scalping stresses the lawn and invites weeds.</li>
              <li><strong>Sharpen your mower blades</strong> at least once a season. Blunt blades tear the leaf and leave that yellow-tipped, ragged look.</li>
              <li><strong>Water deeply, less often.</strong> Light daily watering trains roots to stay near the surface, where they dry out fastest.</li>
              <li><strong>Feed twice a year</strong> as a minimum — early spring and early autumn — with a quality slow-release lawn fertiliser.</li>
              <li><strong>Aerate compacted areas</strong> (paths, play zones) once a year so water and nutrients can actually reach the roots.</li>
            </ul>

            <h2 className="text-3xl font-bold text-foreground pt-6">Sydney-specific tips</h2>
            <p>
              Lower North Shore and Northern Beaches gardens come with their own quirks: salt-laden coastal air, sandy soils close to the beaches, heavy clay further inland, and a lot of established trees throwing dappled shade. If you're on sand, top-dress once a year to lock in moisture and nutrients. If you're on clay, gypsum and aeration are your best friends. And if your lawn is genuinely struggling under deep shade, sometimes the kindest thing is to swap to a shade-tolerant Buffalo or accept that a garden bed might be a better fit than turf.
            </p>

            <h2 className="text-3xl font-bold text-foreground pt-6">When to call in the troops</h2>
            <p>
              A healthy lawn is a long game — the right cut height, the right amount of water, the right feed at the right time. If you'd rather spend your weekends enjoying the yard than maintaining it, that's exactly what we're here for. Our team can take over regular mowing, edging, fertilising and seasonal renovation across the Lower North Shore and Northern Beaches.
            </p>

            <div className="bg-muted/30 border border-border rounded-xl p-6 mt-8">
              <h3 className="text-xl font-semibold text-foreground mb-2">Want a healthier lawn this season?</h3>
              <p className="text-muted-foreground mb-4">
                Tell us about your property and we'll put together a tailored maintenance quote within 24 hours.
              </p>
              <Link to="/#quote">
                <Button className="bg-gradient-primary hover:opacity-90">Request a free quote</Button>
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default TypesOfGrassInAustralia;