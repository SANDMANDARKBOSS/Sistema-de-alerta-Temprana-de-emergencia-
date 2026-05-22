'use client';

import type { ComponentType } from 'react';

// @ts-expect-error The compiled Spline runtime entry has no shipped TypeScript declarations.
import SplineComponent from '../../../node_modules/@splinetool/react-spline/dist/react-spline.js';

export default SplineComponent as ComponentType<any>;
