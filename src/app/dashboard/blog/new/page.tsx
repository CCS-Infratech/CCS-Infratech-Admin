import ProductForm from '@/features/blogs/components/product-form';
import React from 'react';

const page = () => {
  return (
    <div className='h-[calc(100vh-64px)]'>
      <ProductForm pageTitle='Blog Editor' />
    </div>
  );
};

export default page;
