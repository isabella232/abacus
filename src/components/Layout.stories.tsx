import React from 'react'

import Layout from './Layout'

export default { title: 'Layout' }

export const withChildren = (): JSX.Element => (
  <Layout title='Storybook'>
    <div>
      <p>I represent the children.</p>
    </div>
  </Layout>
)
