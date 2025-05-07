'use client';

import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar } from 'recharts';

interface CartsProps {
  data: {
    salesData: Array<{
      month: string;
      totalSales: number;
    }>
  };
};

const Carts = ({ data: { salesData } }: CartsProps) => {
  return (
    <ResponsiveContainer width={'100%'} height={350}>
      <BarChart data={salesData}>
        <XAxis
          dataKey={'month'}
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={value => `$${value}`}
        />
        <Bar
          dataKey={'totalSales'}
          fill='current'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Carts;
