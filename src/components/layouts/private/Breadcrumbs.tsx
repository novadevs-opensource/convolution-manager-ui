import React from 'react'
import { Link } from "react-router-dom";

const Breadcrumbs: React.FC<{items: string[]}> = ({ items }) => (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <nav aria-label="Breadcrumb">
        <ol className="list-reset flex text-sm text-gray-600">
          {items.map((item, index) => (
            <li key={index} className="mr-2">
              <Link to="#" className="text-blue-600 hover:text-blue-800">{item}</Link>
              {index < items.length - 1 && <span className="mx-2">/</span>}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )

export default Breadcrumbs;
