import * as react_jsx_runtime from 'react/jsx-runtime';

type Cost = {
    currency: string;
    amount: number;
};
type EquityPriceDetailsProps = {
    offerEquity: 'yes' | 'no' | null;
    equityCost?: {
        original: Cost;
        discount?: Cost;
        calculated?: Cost;
    };
};
declare const EquityPriceDetails: ({ offerEquity, equityCost, }: EquityPriceDetailsProps) => react_jsx_runtime.JSX.Element | null;

export { EquityPriceDetails };
