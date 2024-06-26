import styled from '@emotion/styled'
import { useMemo, useState } from 'react'

import { TokenAccountOrderByInput } from '@/api/queries/__generated__/baseTypes.generated'
import { useGetCreatorTokenHoldersQuery } from '@/api/queries/__generated__/creatorTokens.generated'
import { BasicCreatorTokenHolderFragment } from '@/api/queries/__generated__/fragments.generated'
import { SvgActionChevronR } from '@/assets/icons'
import { SvgHoldersPlaceholder } from '@/assets/illustrations'
import { Avatar } from '@/components/Avatar'
import { AvatarGroup } from '@/components/Avatar/AvatarGroup'
import { FlexBox } from '@/components/FlexBox'
import { formatNumberShort } from '@/components/NumberFormat'
import { Text } from '@/components/Text'
import { TextButton } from '@/components/_buttons/Button'
import { PieChart, PieDatum, joystreamColors } from '@/components/_charts/PieChart'
import { Widget } from '@/components/_crt/CrtStatusWidget/CrtStatusWidget.styles'
import { SkeletonLoader } from '@/components/_loaders/SkeletonLoader'
import { useMediaMatch } from '@/hooks/useMediaMatch'
import { getMemberAvatar } from '@/providers/assets/assets.helpers'
import { useUser } from '@/providers/user/user.hooks'
import { cVar } from '@/styles'
import { SentryLogger } from '@/utils/logs'

export type HolderDatum = {
  id: string
  value: number
  name: string
  members: {
    handle: string
    avatarUrls: string[]
  }[]
  index: number
}

export type CrtHoldersWidgetProps = {
  tokenId: string
  totalSupply: number
  onShowMore: () => void
}

export const holdersToDatum = (accounts: BasicCreatorTokenHolderFragment[], totalSupply: number): HolderDatum[] =>
  accounts.map((acc, index) => ({
    id: acc.member.handle,
    name: acc.member.handle,
    value: +formatNumberShort((+(acc.totalAmount ?? 0) / totalSupply) * 100),
    members: [
      {
        avatarUrls: getMemberAvatar(acc.member).urls ?? [],
        handle: acc.member.handle,
      },
    ],
    index,
  }))

export const CrtHoldersWidget = ({ tokenId, totalSupply, onShowMore }: CrtHoldersWidgetProps) => {
  const { activeMembership } = useUser()
  const smMatch = useMediaMatch('sm')
  const xsMatch = useMediaMatch('xs')
  const [hoveredHolder, setHoveredHolder] = useState<PieDatum | null>(null)
  const { data, loading } = useGetCreatorTokenHoldersQuery({
    variables: {
      where: {
        token: {
          id_eq: tokenId,
        },
      },
      limit: 6,
      orderBy: TokenAccountOrderByInput.TotalAmountDesc,
    },
    onError: (error) => {
      SentryLogger.error('Failed to fetch token holders', 'CrtHoldersWidget', error)
    },
  })
  const [owner, restChartData] = useMemo(() => {
    let parsedData = data?.tokenAccounts ? holdersToDatum(data.tokenAccounts, totalSupply) : []
    const ownerIdx = parsedData.findIndex((holder) => holder.id === activeMembership?.handle)
    const owner = ownerIdx !== -1 ? parsedData[ownerIdx] : null
    if (ownerIdx !== -1) {
      parsedData = [parsedData.slice(0, ownerIdx), parsedData.slice(ownerIdx + 1, parsedData.length)].flat()
    }

    if (parsedData.length > 3) {
      let namedHoldersAccumulated = owner ? owner.value : 0

      const namedHolders = parsedData.slice(0, 3)
      namedHolders.forEach((holder) => {
        namedHoldersAccumulated += holder.value
      })

      namedHolders.push({
        id: 'Others',
        value: +(100 - namedHoldersAccumulated).toFixed(2),
        name: 'Others',
        index: namedHolders.length,
        members: parsedData.slice(3).map((holder) => ({
          handle: holder.name,
          avatarUrls: holder.members[0].avatarUrls,
        })),
      })

      return [owner, namedHolders]
    }
    return [owner, parsedData]
  }, [activeMembership?.handle, data?.tokenAccounts, totalSupply])

  return (
    <Widget
      title="Holders"
      titleVariant="h500"
      titleColor="colorTextStrong"
      titleBottomMargin={4}
      customTopRightNode={
        <TextButton onClick={onShowMore} icon={<SvgActionChevronR />} iconPlacement="right">
          Show more
        </TextButton>
      }
      customNode={
        <FlexBox minWidth={0} flow={smMatch ? 'row' : 'column'} width="100%" gap={12} equalChildren>
          <FlexBox minWidth={0} flow="column" width="100%">
            <Text variant="h100" as="h1" color="colorTextMuted">
              TOTAL SUPPLY
            </Text>
            {loading ? (
              <FlexBox width="100%" justifyContent="center">
                <SkeletonLoader height={xsMatch ? 300 : 200} width={xsMatch ? 300 : 200} rounded />
              </FlexBox>
            ) : (
              <ChartWrapper>
                <PieChart
                  data={[...restChartData, ...(owner ? [owner] : [])]}
                  onDataHover={setHoveredHolder}
                  hoverOpacity
                  hoveredData={hoveredHolder}
                  valueFormat={(value) => `${value}%`}
                />
              </ChartWrapper>
            )}
          </FlexBox>
          <FlexBox flow="column" gap={6}>
            <FlexBox flow="column" gap={2}>
              <Text variant="h100" as="h1" margin={{ bottom: 4 }} color="colorTextMuted">
                YOU OWN
              </Text>
              {loading ? (
                <ListItemEntryLoader />
              ) : (
                owner && (
                  <HoldersLegendEntry
                    key={owner.id}
                    name={owner.id}
                    members={owner.members}
                    color={joystreamColors[owner.index]}
                    value={owner.value}
                    isActive={owner.id === hoveredHolder?.id}
                    onMouseEnter={() => setHoveredHolder(owner)}
                    onMouseExit={() => setHoveredHolder(null)}
                  />
                )
              )}
            </FlexBox>
            <FlexBox flow="column" gap={2}>
              <Text variant="h100" as="h1" margin={{ bottom: 4 }} color="colorTextMuted">
                TOP HOLDERS
              </Text>
              {loading ? (
                Array.from({ length: 3 }, (_, idx) => <ListItemEntryLoader key={idx} />)
              ) : restChartData.length ? (
                restChartData.map((row) =>
                  row.id === activeMembership?.handle ? null : (
                    <HoldersLegendEntry
                      key={row.id}
                      name={row.id}
                      members={row.members}
                      color={joystreamColors[row.index]}
                      value={row.value}
                      isActive={row.id === hoveredHolder?.id}
                      onMouseEnter={() => setHoveredHolder(row)}
                      onMouseExit={() => setHoveredHolder(null)}
                    />
                  )
                )
              ) : (
                <FlexBox gap={2} flow="column">
                  <SvgHoldersPlaceholder />
                  <Text variant="t100" as="p" margin={{ left: 2 }} color="colorTextMuted">
                    No holders yet.
                  </Text>
                </FlexBox>
              )}
            </FlexBox>
          </FlexBox>
        </FlexBox>
      }
    />
  )
}

type HoldersLegendEntryProps = {
  name: string
  value: number
  color: string
  isActive: boolean
  onMouseEnter: () => void
  onMouseExit: () => void
  members: {
    handle: string
    avatarUrls: string[]
  }[]
}

const HoldersLegendEntry = ({
  name,
  value,
  color,
  isActive,
  onMouseExit,
  onMouseEnter,
  members,
}: HoldersLegendEntryProps) => {
  return (
    <FlexBox
      gap={2}
      alignItems="center"
      style={{ opacity: isActive ? 1 : 0.3 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseExit}
    >
      <ColorBox color={color} />
      <FlexBox alignItems="center">
        {members.length === 1 ? (
          <Avatar assetUrls={members[0].avatarUrls} />
        ) : (
          <AvatarGroup
            avatars={members.map((member) => ({ urls: member.avatarUrls, tooltipText: member.handle }))}
            avatarStrokeColor={cVar('colorBackgroundMuted')}
          />
        )}
        <Text variant="t100" as="p">
          {name}
        </Text>
      </FlexBox>
      <Text variant="t100" as="p">
        {value < 0.01 ? '<0.01' : value}%
      </Text>
    </FlexBox>
  )
}

const ListItemEntryLoader = () => (
  <FlexBox justifyContent="space-between">
    <FlexBox gap={3}>
      <SkeletonLoader height={30} width={30} rounded />
      <SkeletonLoader height={30} width={90} />
    </FlexBox>
    <SkeletonLoader height={30} width={50} />
  </FlexBox>
)

const ColorBox = styled.div<{ color: string }>`
  min-width: 24px;
  min-height: 24px;
  background-color: ${(props) => props.color};
`

const ChartWrapper = styled.div`
  height: 300px;
  width: 100%;
  display: flex;
  justify-content: center;
`
