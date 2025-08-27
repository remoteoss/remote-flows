const formatMoney = (amount: number, currency: string) => {
  return `${amount} ${currency}`;
};

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

export const EquityPriceDetails = ({
  offerEquity,
  equityCost,
}: EquityPriceDetailsProps) => {
  const offersEquity = offerEquity === 'yes';
  const isFeeWaived = !!equityCost?.discount;
  const formattedWaivedPrice =
    equityCost && equityCost.original
      ? formatMoney(equityCost.original.amount, equityCost.original.currency)
      : null;
  const formattedPrice =
    equityCost && equityCost.calculated
      ? formatMoney(
          equityCost.calculated.amount,
          equityCost.calculated.currency,
        )
      : null;

  if (!offersEquity || !equityCost) {
    return null;
  }

  return (
    <div className='RemoteFlows__EquityPriceDetails'>
      <span className='RemoteFlows__Equity__Price'>
        A monthly fee of{' '}
        <strong>
          {isFeeWaived ? (
            <>
              <s>{formattedWaivedPrice}</s> {formattedPrice}
            </>
          ) : (
            formattedPrice
          )}{' '}
          will apply.
        </strong>
      </span>
      <span className='RemoteFlows__Equity__Fee'>
        This is a fee for managing equity through Remote.
      </span>
      <span className='RemoteFlows__Equity__Reporting'>
        To fulfill local reporting obligations, Remote must note any equity
        grants made and any related taxable events, such as exercising stock
        options and RSU vesting.
      </span>
    </div>
  );
};
