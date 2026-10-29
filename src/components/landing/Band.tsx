import Image from "next/image";
export function Band() {
  return (
    <section className="band">
      <div className="band-media par" data-speed="0.16">
        <Image
          src="/media/food/band-overhead.jpg"
          alt="restaurant table shot from above"
          width={1180}
          height={1572}
          sizes="100vw"
        />
      </div>
      <div className="band-cap">
        <span className="eyebrow k reveal">Crumbify</span>
        <p className="reveal">Every bite tells a story.</p>
      </div>
    </section>
  );
}
