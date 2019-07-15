import Head from 'next/head';

export default () => (
  <>
    <Head>
      <title>Offline Next.js with Now 2.0</title>
      <link rel="manifest" href="/static/manifest.json" />
      <meta name="theme-color" content="#72B340" />
      <meta
        name="description"
        content="make your Next.js application work offline using service workers via Google's workbox"
      />
    </Head>

    <div className="hero">
      <h1 className="title">Offline Next.js with Now 2.0</h1>
    </div>

    <style jsx>{`
      .hero {
        width: 100%;
        color: #333;
        text-align: center;
      }
      .title {
        font-family: sans-serif;
        margin: 0;
        width: 100%;
        padding-top: 80px;
        line-height: 1.15;
        font-size: 48px;
      }
      .row {
        max-width: 880px;
        margin: 80px auto 40px;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
      }
    `}</style>
  </>
);
