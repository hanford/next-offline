export default () => (
  <>
    <div className="hero">
    <h1 className="title">Offline Next.js with Now 1.0</h1>
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
)