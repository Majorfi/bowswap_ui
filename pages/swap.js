import	React				from	'react';
import	{BowswapContextApp}	from	'contexts/useBowswap';
import	{PathsContextApp}	from	'contexts/usePaths';
import	Bowswap				from	'components/Bowswap';

function	Index({prices}) {
	return <Bowswap prices={prices} />;
}

Index.getLayout = function getLayout(page) {
	return (
		<BowswapContextApp>
			<PathsContextApp>
				{page}
			</PathsContextApp>
		</BowswapContextApp>
	);
};

export default Index;
