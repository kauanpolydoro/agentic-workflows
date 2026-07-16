import unittest
import service
class ServiceTest(unittest.TestCase):
    def setUp(self): service.ITEMS={"A-1":4}
    def test_missing_is_zero(self): self.assertEqual(service.get_quantity("missing"),0)
    def test_reserve(self): self.assertTrue(service.reserve("A-1",2)); self.assertEqual(service.get_quantity("A-1"),2)
if __name__ == "__main__": unittest.main()
