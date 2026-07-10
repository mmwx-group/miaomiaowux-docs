import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'
import { UsersDemo } from '@/components/docs/users-demo'

export const Route = createFileRoute('/docs/users')({
  component: UsersPage,
})

function UsersPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('users.title')} description={t('users.description')}>
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('users.demo.heading2')}</h2>
        <p className='text-muted-foreground mb-4'>{t('users.demo.description')}</p>
        <UsersDemo />
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('users.overview.heading')}</h2>
        <p className='text-muted-foreground'>{t('users.overview.text')}</p>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('users.roles.heading')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('users.roles.roleCol')}</th><th className='text-left py-3 px-4'>{t('users.roles.permissionCol')}</th><th className='text-left py-3 px-4'>{t('users.roles.descCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4'>{t('users.roles.admin')}</td><td className='py-3 px-4'>{t('users.roles.adminPerm')}</td><td className='py-3 px-4'>{t('users.roles.adminDesc')}</td></tr>
              <tr><td className='py-3 px-4'>{t('users.roles.user')}</td><td className='py-3 px-4'>{t('users.roles.userPerm')}</td><td className='py-3 px-4'>{t('users.roles.userDesc')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('users.createUser.heading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-sm space-y-3 text-muted-foreground'>
              <p>{t('users.createUser.step1')}</p>
              <p>{t('users.createUser.step2')}</p>
              <p>{t('users.createUser.step3')}</p>
              <p>{t('users.createUser.step4')}</p>
              <p>{t('users.createUser.step5')}</p>
              <p>{t('users.createUser.step6')}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('users.subToken.heading')}</h2>
        <p className='text-muted-foreground mb-4'>
          {t('users.subToken.text')}
        </p>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('users.auth.heading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-sm space-y-2 text-muted-foreground'>
              <p>{t('users.auth.text')}</p>
              <ul className='space-y-1 ml-4'>
                <li>{t('users.auth.item1')}</li>
                <li>{t('users.auth.item2')}</li>
                <li>{t('users.auth.item3')}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>
    </XDocLayout>
  )
}
