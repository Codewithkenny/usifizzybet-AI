// "use client";

// import React from "react";
// import Link from "next/link";
// import { Image } from "@/components/ui/image";
// import { Button } from "@/components/ui/button";
// import { ArrowRight } from "lucide-react";

// // Native placeholder image data assets cleanly isolated away from external hosts
// const FLYERS = [
//   {
//     src: "/images/public/football-basketball.png",
//     eyebrow: "Today's slate",
//     title: "Two free tips every day",
//     body: "Open a free account and see today's two preview tips with confidence grades. Subscribers unlock the rest.",
//     href: "/picks",
//     cta: "See today's tips",
//   },
//   {
//     src: "/images/public/trends-chart.png",
//     eyebrow: "SafeBets",
//     title: "Multi-leg tips at 5, 10 and 50 odds",
//     body: "Lower-variance markets built into one slip, published before kick-off and graded on the public ledger.",
//     href: "/safe-bets",
//     cta: "Browse SafeBets",
//   },
// ];

// export default function FlyerStrip() {
//   return (
//     <section className="border-b border-border bg-secondary/30">
//       <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
//         <p className="eyebrow">BetCode9ja</p>
//         <h2 className="mt-3 max-w-xl font-display text-3xl font-bold tracking-[-0.02em] text-foreground md:text-4xl">
//           Football. Basketball. Nothing else.
//         </h2>
//         <div className="mt-8 grid gap-5 md:grid-cols-2">
//           {FLYERS.map((flyer) => (
//             <article
//               key={flyer.title}
//               className="group overflow-hidden rounded-3xl border border-border bg-card"
//             >
//               <div className="relative aspect-[16/10] overflow-hidden">
//                 <Image
//                   src={flyer.src}
//                   alt={flyer.title}
//                   fittingType="fill"
//                   className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
//               </div>
//               <div className="p-6">
//                 <p className="eyebrow text-primary">{flyer.eyebrow}</p>
//                 <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-foreground">
//                   {flyer.title}
//                 </h3>
//                 <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
//                   {flyer.body}
//                 </p>
//                 <Button variant="outline" className="mt-5 font-display" asChild>
//                   <Link href={flyer.href}>
//                     {flyer.cta} <ArrowRight className="ml-1.5 h-4 w-4" />
//                   </Link>
//                 </Button>
//               </div>
//             </article>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
