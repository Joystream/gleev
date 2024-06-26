import { FC, useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { ActionDialogButtonProps } from '@/components/ActionBar'
import { FlexBox } from '@/components/FlexBox'
import { ColumnBox } from '@/components/NonLinearProgressWidget/NonLinearProgressWidget.styles'
import { Text } from '@/components/Text'
import { CrtMarketForm } from '@/components/_crt/MarketDrawer/MarketDrawer.types'
import { Checkbox } from '@/components/_inputs/Checkbox'
import { FormField } from '@/components/_inputs/FormField'
import { TextArea } from '@/components/_inputs/TextArea'
import { useConfirmationModal } from '@/providers/confirmationModal'

type MarketStepProps = {
  setPrimaryButtonProps: (props: ActionDialogButtonProps) => void
  setSecondaryButtonProps: (props: ActionDialogButtonProps) => void
  tokenName: string
  formDefaultValue: CrtMarketForm
  onClose: () => void
  onNextStep: (props: CrtMarketForm) => void
}

export const MarketStep: FC<MarketStepProps> = ({
  tokenName,
  setPrimaryButtonProps,
  onNextStep,
  formDefaultValue,
  setSecondaryButtonProps,
  onClose,
}) => {
  const {
    control,
    handleSubmit,
    resetField,
    watch,
    formState: { isDirty, errors },
  } = useForm<CrtMarketForm>({
    defaultValues: formDefaultValue,
  })

  const [openDialog, closeDialog] = useConfirmationModal({
    type: 'warning',
    title: 'Discard changes?',
    description:
      'You have unsaved changes which are going to be lost if you close this window. Are you sure you want to continue?',
    primaryButton: {
      variant: 'warning',
      text: 'Confirm and discard',
      onClick: () => {
        closeDialog()
        onClose()
      },
    },
    secondaryButton: {
      text: 'Cancel',
      onClick: () => closeDialog(),
    },
  })

  const isChecked = watch('isChecked')
  const handleGoToNextStep = useCallback(() => {
    handleSubmit((data) => {
      onNextStep(data)
    })()
  }, [handleSubmit, onNextStep])

  useEffect(() => {
    setPrimaryButtonProps({
      text: 'Next',
      onClick: () => {
        handleGoToNextStep()
      },
    })
    setSecondaryButtonProps({
      text: 'Cancel',
      onClick: () => (isDirty ? onClose() : openDialog()),
    })
  }, [handleGoToNextStep, isDirty, onClose, openDialog, setPrimaryButtonProps, setSecondaryButtonProps])

  return (
    <ColumnBox gap={2}>
      <FlexBox alignItems="center">
        <Text variant="h500" as="span" margin={{ right: 4 }}>
          Market
        </Text>
        {/*<TextButton as="span" icon={<SvgActionPlay />} iconPlacement="left" color="colorTextPrimary">*/}
        {/*  Learn more*/}
        {/*</TextButton>*/}
      </FlexBox>
      <Text variant="t300" color="colorText" as="p" margin={{ bottom: 4 }}>
        Automated market maker (AMM) will increase ${tokenName} price after each purchase and decrease its price when
        someone sells it to the AMM.
      </Text>

      <FormField
        label="Terms and conditions"
        description="Change default rules if you want to add some additional terms."
        error={errors.tnc?.message}
      >
        <Controller
          control={control}
          render={({ field: { value: isChecked, onChange } }) => (
            <Checkbox
              value={isChecked}
              label="Keep the default terms & conditions"
              onChange={(checked) => {
                if (checked) {
                  resetField('tnc')
                }
                onChange(checked)
              }}
            />
          )}
          name="isChecked"
        />
        <Controller
          control={control}
          rules={{
            validate: {
              value: (value) => {
                if (!value) {
                  return 'You need to fill in the terms and conditions to proceed'
                }
                return true
              },
            },
          }}
          render={({ field: { value: tnc, onChange } }) => (
            <TextArea rows={7} value={tnc} disabled={isChecked} onChange={onChange} />
          )}
          name="tnc"
        />
      </FormField>
    </ColumnBox>
  )
}
