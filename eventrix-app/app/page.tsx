import Image from "next/image";

export default function Home() {
  return (
    <div className="landing-page">
      <header>
        <div className="container">
          <a href="#" className="logo">Your <b>Website</b></a>
          <ul className="links">
            <li>Home</li>
            <li>About Us</li>
            <li>Work</li>
            <li>Info</li>
            <li>Get Started</li>
          </ul>
        </div>
      </header>
      <div className="content">
        <div className="container">
          <div className="info">
            <h1>Looking For Inspiration</h1>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus odit nihil ullam nesciunt quidem iste, Repellendus odit nihil</p>
            <button>Button name</button>
          </div>
          <div className="image">
            <Image
              src="https://i.postimg.cc/65QxYYzh/001234.png"
              alt="Landing page illustration"
              width={500}
              height={500}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
