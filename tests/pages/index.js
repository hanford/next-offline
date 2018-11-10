import React from 'react'
import Link from 'next/link'
import Head from '../components/head'

const App = () => (
  <>
    <Head title="App" />

    <div className="hero">
      <h1 className="title">next-offline test</h1>
    </div>

    <style jsx>{`
      body {
        font-family: sans-serif;
      }
      .hero {
        width: 100%;
        color: #333;
      }
      .title {
        margin: 0;
        width: 100%;
        padding-top: 80px;
        line-height: 1.15;
        font-size: 48px;
      }
      .title,
      .description {
        text-align: center;
      }
    `}</style>
  </>
)

export default App