import React, { useState } from 'react';
import styled from 'styled-components';
import MoneyIcon from '@material-ui/icons/Money';
import BuildIcon from '@material-ui/icons/Build';
import SignalCellularAltIcon from '@material-ui/icons/SignalCellularAlt';
import { green, orange, yellow } from '@material-ui/core/colors';
import { Customer } from 'reducers/customer.types';
import { Card } from '@material-ui/core';
import PricingCards from './pricing-cards';
import DefaultPricing from './pricing-types/default-pricing';
import TierPricing from './pricing-types/tier-pricing';
import CustomPricing from './pricing-types/custom-pricing';
import { useDispatch } from 'react-redux';
import BCCircularLoader from 'app/components/bc-circular-loader/bc-circular-loader';
import PORequired from './pricing-types/po-required';


interface PricingProps {
    customer: Customer;
}

const PricingTypes = [
/*  {
    'color': green,
    'icon': MoneyIcon,
    'subtitle': 'Use default pricing for all invoice items',
    'title': 'Default Pricing'

  },*/
  {
    'color': orange,
    'icon': SignalCellularAltIcon,
    'subtitle': 'Assign a Tier Pricing level',
    'title': 'Tier Pricing'
  },
  {
    'color': orange,
    'icon': SignalCellularAltIcon,
    'subtitle': 'Set Customer PO Required',
    'title': 'PO Required'
  },
/*  {
    'color': yellow,
    'icon': BuildIcon,
    'subtitle': 'Create custom prices for customer',
    'title': 'Custom Pricing'
  }*/
];


export default function Pricing({ customer }:PricingProps) {
  const dispatch = useDispatch();
/*  const currentActive = customer?.isCustomPrice
    ? 2
    : customer?.itemTier?.isActive
      ? 1
      : 0;*/

  const [active, setActive] = useState(0);

  const handleClick = (index:number) => {
    setActive(index);
  };

  if (!customer) {
    return <BCCircularLoader heightValue={'100px'} />;
  }


  return (
    <PricingContainer>
      <div className={'pricing-select'}>
        <PricingCards
          active={active}
          pricing={PricingTypes}
          setActive={handleClick}
        />
      </div>
      <Card className={'pricing-detail'}>
{/*        {active === 0 && <DefaultPricing
          customer={customer}
          dispatch={dispatch}
          header={PricingTypes[active]}
        />}*/}
        {active === 0 && <TierPricing
          customer={customer}
          dispatch={dispatch}
          header={PricingTypes[active]}
        />}
{/*        {active === 2 && <CustomPricing
          customer={customer}
          dispatch={dispatch}
          header={PricingTypes[active]}
        />}*/}
        {active === 1 && <PORequired
          customer={customer}
          dispatch={dispatch}
          header={PricingTypes[active]}
        />}
      </Card>
    </PricingContainer>
  );
}

const PricingContainer = styled.div`
display: flex;
    .pricing-select {
        flex: 2;
        margin-right: 16px;
    }

    .pricing-detail {
        flex: 4;
        background: white;
        .body {
            padding: 20px 30px 50px;
        }
    }

`;

