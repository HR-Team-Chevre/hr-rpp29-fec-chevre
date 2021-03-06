import React from 'react';
import { AiOutlineCheck } from 'react-icons/ai';

const ProductExtra = (props) => (
  <div id="product-extra">
    <div id="product-description">
      <p id="description-title">{props.product?.slogan}</p>
      <p id="description">{props.product?.description}</p>
    </div>
    <div id="product-features">

      {props.product?.features?.map(feature => (
        <div className="feature" key={feature.value}>
          <div className="check">
            <AiOutlineCheck />
          </div>
          <p>{feature.value}</p>
        </div>
      ))}

    </div>
  </div>
);

export default ProductExtra;