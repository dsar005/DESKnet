import os

base = r'e:\desknet1'

LOGO_OLD = '<div class="logo-mark">DN</div>'
LOGO_NEW = '<div class="logo-mark"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="17" height="17" stroke="white" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>'

ANN_OLD = '\U0001F680 Free shipping on orders over $75'
ANN_NEW = '<i data-feather="truck" aria-hidden="true"></i> Free shipping on orders over $75'

files = ['index.html','shop.html','product.html','about.html','contact.html','cart.html','terms.html','shipping.html','faq.html','privacy.html','refund.html']

for f in files:
    path = os.path.join(base, f)
    with open(path, 'r', encoding='utf-8') as fh:
        content = fh.read()
    logo_count = content.count(LOGO_OLD)
    ann_count = content.count(ANN_OLD)
    content = content.replace(LOGO_OLD, LOGO_NEW)
    content = content.replace(ANN_OLD, ANN_NEW)
    with open(path, 'w', encoding='utf-8') as fh:
        fh.write(content)
    print(f"Done {f}: logos={logo_count} ann={ann_count}")

print("All done!")
