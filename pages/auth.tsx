import dynamic from 'next/dynamic'
import React from 'react'

const NoSsrRoutes = dynamic(() => import('@/Routes'), { ssr: false })

export default function (): JSX.Element | null {
  return <NoSsrRoutes />
}
