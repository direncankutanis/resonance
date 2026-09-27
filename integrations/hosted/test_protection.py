import io,json,os,unittest
from unittest.mock import patch
from integrations.hosted import service
from integrations.latch import ai_plans
from integrations.latch.protection_plans import validate_protection,generate_protection
PLAN={'action':'protect','balance':10000,'floor':4000,'weekly':2000,'order':1000,'limit':800,'freshness':30,'explanation':'Keep the stated reserve and enforce all limits.'}
class ProtectionTests(unittest.TestCase):
    def test_boundaries(self):
        self.assertEqual(validate_protection(PLAN),PLAN)
        for changes in [{'floor':10000},{'order':2100},{'freshness':0},{'weekly':True},{'balance':10000.1},{'extra':1},{'action':'buy'},{'explanation':''}]:
            with self.assertRaises(ValueError):validate_protection({**PLAN,**changes})
    def test_same_ai_quota(self):
        with patch.dict(os.environ,{'RESONANCE_HOSTED_SERVICES':'enabled','GEMINI_API_KEY':'fake'},clear=True),patch.object(service,'admit',return_value=(True,1)) as admit,patch.object(service,'generate_protection',return_value=PLAN):
            code,result,_=service.process('protection',{'prompt':'test'})
            self.assertEqual(code,200);self.assertFalse(result['executed']);admit.assert_called_once_with('ai')
        with patch.dict(os.environ,{'RESONANCE_HOSTED_SERVICES':'enabled','GEMINI_API_KEY':'fake'},clear=True),patch.object(service,'admit',return_value=(False,60)),patch.object(service,'generate_protection') as model:
            self.assertEqual(service.process('protection',{'prompt':'test'})[0],429);model.assert_not_called()
    def test_extract_and_reject(self):
        for plan,expected in [(PLAN,None),({**PLAN,'action':'reject'},'clarify'),({**PLAN,'floor':99999},'invalid_response')]:
            raw=json.dumps({'candidates':[{'finishReason':'STOP','content':{'parts':[{'text':json.dumps(plan)}]}}]}).encode()
            with patch.object(ai_plans.urllib.request,'urlopen',return_value=io.BytesIO(raw)) as provider:
                if expected:
                    with self.assertRaises(ai_plans.AIUnavailable) as error:generate_protection('test',api_key='fake')
                    self.assertEqual(error.exception.code,expected)
                else:self.assertEqual(generate_protection('test',api_key='fake'),PLAN)
                payload=json.loads(provider.call_args.args[0].data)
                self.assertIn('ALL SIX',payload['systemInstruction']['parts'][0]['text'])
    def test_endpoint_payload(self):
        self.assertEqual(service.parse_body('{"prompt":"test"}','protection'),{'prompt':'test'})
        with self.assertRaises(ValueError):service.parse_body('{"prompt":"test","budget":100}','protection')
if __name__=='__main__':unittest.main()
