import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'

export const Route = createFileRoute('/docs/system-requirements')({
  component: SystemRequirementsPage,
})

function SystemRequirementsPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('systemRequirements.title')} description={t('systemRequirements.description')}>
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('systemRequirements.master.heading')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('systemRequirements.itemCol')}</th><th className='text-left py-3 px-4'>{t('systemRequirements.requirementCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4'>{t('systemRequirements.os')}</td><td className='py-3 px-4'>Linux (amd64/arm64) / Windows</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>{t('systemRequirements.memory')}</td><td className='py-3 px-4'>128MB+</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>{t('systemRequirements.disk')}</td><td className='py-3 px-4'>{t('systemRequirements.diskValue')}</td></tr>
              <tr><td className='py-3 px-4'>{t('systemRequirements.port')}</td><td className='py-3 px-4'>{t('systemRequirements.masterPortValue')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('systemRequirements.agent.heading')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('systemRequirements.itemCol')}</th><th className='text-left py-3 px-4'>{t('systemRequirements.requirementCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4'>{t('systemRequirements.os')}</td><td className='py-3 px-4'>Linux (amd64/arm64)</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>{t('systemRequirements.memory')}</td><td className='py-3 px-4'>64MB+</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>{t('systemRequirements.port')}</td><td className='py-3 px-4'>{t('systemRequirements.agentPortValue')}</td></tr>
              <tr><td className='py-3 px-4'>{t('systemRequirements.network')}</td><td className='py-3 px-4'>{t('systemRequirements.networkValue')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('systemRequirements.firewall.heading')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('systemRequirements.port')}</th><th className='text-left py-3 px-4'>{t('systemRequirements.firewall.usageCol')}</th><th className='text-left py-3 px-4'>{t('systemRequirements.firewall.locationCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4'>12889</td><td className='py-3 px-4'>{t('systemRequirements.firewall.masterPanel')}</td><td className='py-3 px-4'>{t('systemRequirements.firewall.masterSide')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>23889</td><td className='py-3 px-4'>{t('systemRequirements.firewall.agentApi')}</td><td className='py-3 px-4'>{t('systemRequirements.firewall.remoteSide')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>443</td><td className='py-3 px-4'>{t('systemRequirements.firewall.tlsInbound')}</td><td className='py-3 px-4'>{t('systemRequirements.firewall.remoteSide')}</td></tr>
              <tr><td className='py-3 px-4'>{t('systemRequirements.firewall.custom')}</td><td className='py-3 px-4'>{t('systemRequirements.firewall.xrayInbound')}</td><td className='py-3 px-4'>{t('systemRequirements.firewall.remoteSide')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </XDocLayout>
  )
}
