import AdStrip from "@/components/home/AdStrip";
// import FlyerStrip from "@/components/home/FlyerStrip";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import RecordList from "@/components/home/RecordList";
import StatsRow from "@/components/home/StatsRow";
import Testimonials from "@/components/home/Testimonials";
import VideoAd from "@/components/home/VideoAd";

export default function HomePage() {
  return (
    <>
      {/* <FlyerStrip /> */}
      <Hero />
      <HowItWorks />
      <VideoAd />
      <RecordList />
      <StatsRow />
      <AdStrip />
      <Testimonials />
    </>
  );
}
