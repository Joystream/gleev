import { SvgActionLinkUrl } from '@/assets/icons'
import { EmptyFallback } from '@/components/EmptyFallback'
import { GridItem, LayoutGrid } from '@/components/LayoutGrid'
import { YppReferralTable } from '@/components/YppReferralTable/YppReferralTable'
import { ReferralLinkButton } from '@/components/_ypp/ReferralLinkButton'
import { YppSuspendedBanner } from '@/components/_ypp/YppSuspendedBanner'
import { atlasConfig } from '@/config'
import { useYppReferralPagination } from '@/hooks/useYppReferralPagination'

import { FallbackContainer } from '../YppDashboardTabs.styles'

const TILES_PER_PAGE = 10

export const YppDashboardReferralsTab = () => {
  const yppSuspended = atlasConfig.features.ypp.suspended
  const { isLoading, yppReferrals, currentPage, setCurrentPage, perPage, setPerPage, totalCount } =
    useYppReferralPagination({ initialPageSize: TILES_PER_PAGE })

  return (
    <LayoutGrid>
      {yppSuspended && (
        <GridItem colSpan={{ base: 12 }}>
          <YppSuspendedBanner />
        </GridItem>
      )}
      <GridItem colSpan={{ base: 12 }}>
        {!isLoading && totalCount === 0 ? (
          <FallbackContainer>
            <EmptyFallback
              title="No referred users yet"
              variant="large"
              subtitle="You will see all referred users here once someone uses your link to sign up to the program."
              button={!yppSuspended ? <ReferralLinkButton variant="secondary" icon={<SvgActionLinkUrl />} /> : null}
            />
          </FallbackContainer>
        ) : (
          <YppReferralTable
            data={yppReferrals}
            isLoading={isLoading}
            pagination={{
              page: currentPage,
              setPerPage,
              totalCount,
              itemsPerPage: perPage,
              onChangePage: setCurrentPage,
            }}
          />
        )}
      </GridItem>
    </LayoutGrid>
  )
}
