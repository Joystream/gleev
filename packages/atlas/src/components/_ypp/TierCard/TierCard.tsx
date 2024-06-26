import {
  SvgIconRankBronzeMonochrome,
  SvgIconRankDiamondMonochrome,
  SvgIconRankGoldMonochrome,
  SvgIconRankSilverMonochrome,
} from '@/assets/icons'
import { FlexBox } from '@/components/FlexBox'
import { Text } from '@/components/Text'
import { RewardWrapper, TierBanner, Wrapper } from '@/components/_ypp/TierCard/TierCard.styles'
import { capitalizeFirstLetter } from '@/utils/misc'

export type TierCardProps = {
  tier: 'bronze' | 'silver' | 'gold' | 'diamond'
  reqs: string[]
  rewards: number[] // [signup, sync per video, referral]
}

const getRewardTitle = (idx: number) => {
  switch (idx) {
    case 0:
      return 'Sign up'
    case 1:
      return 'Sync per video'
    case 2:
      return 'Referral'
    default:
      return 'Unkown'
  }
}

const getTierIcon = (tier: TierCardProps['tier']) => {
  switch (tier) {
    case 'diamond':
      return <SvgIconRankDiamondMonochrome />
    case 'gold':
      return <SvgIconRankGoldMonochrome />
    case 'silver':
      return <SvgIconRankSilverMonochrome />
    case 'bronze':
    default:
      return <SvgIconRankBronzeMonochrome />
  }
}

export const TierCard = ({ rewards, tier }: TierCardProps) => {
  return (
    <Wrapper isDiamond={tier === 'diamond'}>
      <FlexBox flow="column" gap={4}>
        <TierBanner tier={tier}>
          <FlexBox flow="column" gap={1.5} alignItems="center">
            {getTierIcon(tier)}
            <Text variant="t100-strong" as="p">
              {capitalizeFirstLetter(tier)}
            </Text>
          </FlexBox>
          <svg>
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="1" numOctaves="1" stitchTiles="stitch" />
              <feBlend in="SourceGraphic" in2="colorNoise" mode="multiply" />
            </filter>
          </svg>
        </TierBanner>
      </FlexBox>
      <FlexBox flow="column" gap={2} width="100%">
        <Text variant="t200-strong" as="p">
          Rewards
        </Text>
        {rewards.map((price, idx) => (
          <RewardWrapper key={idx}>
            <Text variant="t200" as="p" color="colorText">
              {getRewardTitle(idx)}
            </Text>
            <Text variant="t200-strong" as="p">
              {price === 0 ? 'Not paid' : `${idx === 2 ? 'Up to ' : ''}+${price} USD`}
            </Text>
          </RewardWrapper>
        ))}
      </FlexBox>
    </Wrapper>
  )
}
