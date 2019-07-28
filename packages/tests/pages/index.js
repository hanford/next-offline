import React from 'react'
import Link from 'next/link'

import { register, unregister } from 'next-offline/runtime'

const App = () => {
  return (
    <>
      <h1 className="title">tests</h1>


      <button onClick={() => register()}>register</button>
      <button onClick={() => unregister()}>unregister</button>

      <img src='static/image.jpg' />

      <style jsx>{`
        body {
          font-family: sans-serif;
          width: 100%;
          color: #333;
          margin: 0 auto;
          padding: 0 20px;
        }

        .title {
          margin: 20px 0;
          width: 100%;
        }

        #__next {
          display: flex;
          flex-direction: column;
        }

        button {
          max-width: 200px;
          padding: 8px 16px;
          margin-bottom: 20px;
        }

        img {
          max-width: 100%;
          width: 200px;
        }
      `}</style>
    </>
  )
}

export default App