let _mainModule = angular.module( "mainModule", [] );

_mainModule.factory(
    'httpFactory'
    , function() {
        return {
            'promesa': ( _promesa, _callback) => {
                _promesa.then(
                    ( _resp ) => {
                        _callback({
                            'success': true
                            , 'data': _resp.data
                            , 'msg': ''
                        });
                    }
                    , ( _resp ) => {
                        _callback({
                            'success': false
                            , 'data': _resp.data
                            , 'msg': ''
                        });
                    }
                );
            }
        }
    }
);

_mainModule.factory(
    'mainFactory'
    , function( $http, httpFactory ) {
        return {
            'getPokemon': ( _codigo, _callback ) => {
                httpFactory.promesa(
                    $http.get('https://pokeapi.co/api/v2/pokemon/' + _codigo)
                    , _callback
                );
            }
        }
    }
);

_mainModule.controller(
    'mainCtrl'
    , function( $scope, $timeout, mainFactory ) {

        const POKE_PER_FILL = 10;
        const MIN_POK = 0;
        const MAX_POK = 898;

        $scope.pokeTypeList = [
            { 'type_name': 'normal', 'type_color': '#a8a678' }
            , { 'type_name': 'fighting', 'type_color': '#c13129' }
            , { 'type_name': 'flying', 'type_color': '#96a3df' }
            , { 'type_name': 'poison', 'type_color': '#bb5a9f' }
            , { 'type_name': 'ground', 'type_color': '#e6d3a8' }
            , { 'type_name': 'rock', 'type_color': '#bea563' }
            , { 'type_name': 'bug', 'type_color': '#a9bd42' }
            , { 'type_name': 'ghost', 'type_color': '#6762b2' }
            , { 'type_name': 'steel', 'type_color': '#aeacc2' }
            , { 'type_name': 'fire', 'type_color': '#fe4833' }
            , { 'type_name': 'water', 'type_color': '#1f93f6' }
            , { 'type_name': 'grass', 'type_color': '#74d76a' }
            , { 'type_name': 'electric', 'type_color': '#fbc344' }
            , { 'type_name': 'psychic', 'type_color': '#fd6fa1' }
            , { 'type_name': 'ice', 'type_color': '#47cee4' }
            , { 'type_name': 'dragon', 'type_color': '#8466ec' }
            , { 'type_name': 'dark', 'type_color': '#765a4e' }
            , { 'type_name': 'fairy', 'type_color': '#fdb6f2' }
        ];

        $scope.pokemonIdMin = 0;
        $scope.pokemonIdMax = 0;
        $scope.adicionandoPokemon = false;
        $scope.pokeSelected = {};
        $scope.pokeList = [];

        $scope.getConsecutivo = ( _alFrente ) => {
            let _min = _alFrente ? $scope.pokemonIdMax : ($scope.pokemonIdMin - POKE_PER_FILL);
            let _max = _alFrente ? ($scope.pokemonIdMax + POKE_PER_FILL) : $scope.pokemonIdMin;

            _min = _min < MIN_POK ? MIN_POK : _min;
            _max = _max < MIN_POK ? MIN_POK : _max;

            _min = _min > MAX_POK ? MAX_POK : _min;
            _max = _max > MAX_POK ? MAX_POK : _max;

            _alFrente
                ? ( $scope.pokemonIdMax = _max )
                : ( $scope.pokemonIdMin = _min );

            console.log(_min, _max);
            return Array(_max - _min).fill().map((_, idx) => _min + idx + (_alFrente ? 1 : 0));
        };

        $scope.getPokeList = ( _alFrente, _consecutivoInicial, _callback ) => {
            _callback = _callback || (()=>{})
            if(!$scope.adicionandoPokemon) {
                $scope.adicionandoPokemon = true;
                _alFrente = !!_alFrente;

                if( _consecutivoInicial ) {
                    _alFrente = true;
                    $scope.pokemonIdMin = _consecutivoInicial;
                    $scope.pokemonIdMax = _consecutivoInicial;
                }

                let _arrayList = ($scope.getConsecutivo( _alFrente ) || []).map( _id => {
                    let _codigo = ((_id + '').padStart(3,'0'));
                    return {
                        'id': _id
                        , 'code': _codigo
                        , 'image': 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/' + _codigo + '.png'
                    }
                });
                if( _arrayList.length ) {
                    $scope.pokeList.splice( _alFrente ? $scope.pokeList.length : 0 , 0, ..._arrayList);
                    _callback( true );
                } else {
                    _callback( false );
                }

                $timeout(
                    () => {
                        $scope.adicionandoPokemon = false;
                    }
                    , 1000
                );
            } else {
                _callback( false );
            }
        };

        $scope.selectPokemon = ( _pokemon ) => {
            ($scope.pokeList || []).forEach( _i => _i.selected = false );

            if( !_pokemon.loaded ) {
                _pokemon.loading = true;
                mainFactory.getPokemon(
                    _pokemon.id
                    , ( _response ) => {

                        _pokemon.loading = false;
                        if(_response.success) {
                            _pokemon.selected = true;
                            _pokemon.loaded = true;
                            _pokemon.info = _response.data;
                            _pokemon.name = (_pokemon.info?.name || '').toUpperCase();
                            _pokemon.resume = [];


                            _pokemon.types = [];
                            let _backgroundStyleColors = [];
                            (_pokemon.info?.types || [])
                                .forEach( ( _t, _i ) => {
                                    let _type = $scope.pokeTypeList.find( _tL => _tL.type_name == _t.type.name );
                                    if( _type ) {
                                        _pokemon.types.push( _type );

                                        if( true || _i < 2 ) {
                                            _backgroundStyleColors.push( _type.type_color );
                                        }
                                    }
                                });

                            _pokemon.resume.push({ label: 'NUMBER'      , value: _pokemon.code                                                              });
                            _pokemon.resume.push({ label: 'BASE EXP'    , value: _pokemon.info?.base_experience || 0                                        });
                            _pokemon.resume.push({ label: 'TYPE'        , value: (_pokemon.info?.types || [])[0]?.type?.name?.toUpperCase()                 });
                            _pokemon.resume.push({ label: 'HABILITY'    , value: (_pokemon.info?.abilities || [])[0]?.ability?.name?.toUpperCase()          });
                            _pokemon.resume.push({ label: 'HEIGHT'      , value: (_pokemon.info?.height || 0) + 'm'                                         });
                            _pokemon.resume.push({ label: 'WEIGHT'      , value: (_pokemon.info?.weight || 0) + 'Kg'                                        });


                            if( _backgroundStyleColors.length == 1 ) {
                                _backgroundStyleColors.push( _backgroundStyleColors[0] );
                            }

                            _pokemon.style = {
                                'background-image': 'linear-gradient( 135deg , ' + _backgroundStyleColors.join(', ') + ' )'
                            };


                            $scope.pokeSelected = _pokemon;
                        }

                    });
            } else {
                _pokemon.selected = true;
                $scope.pokeSelected = _pokemon;
            }
        };


        $scope.init = () => {
            $scope.getPokeList(true, 490, ( _status ) => {
                if( _status ) $scope.selectPokemon( $scope.pokeList[0] );
            });

            $scope.pokeTypeList.forEach( _type => {_type.style = {'background-color': _type.type_color};});

            let _elementPokeList = document.getElementById('pokeListID');
            _elementPokeList.addEventListener(
                'scroll'
                , ( _event ) => {
                    let _umbral = 0;
                    let _dif = _elementPokeList.scrollLeftMax - _elementPokeList.scrollLeft;
                    let _alFrente = true;
                    let _adicionarPokemon = false;

                    if(_dif <= _umbral ) {
                        _alFrente = true;
                        _adicionarPokemon = true;
                    } else if(_elementPokeList.scrollLeftMax - _dif <= 20) {
                        _alFrente = false;
                        _adicionarPokemon = true;
                    }

                    if(_adicionarPokemon) $scope.getPokeList( _alFrente );

                }
            )
        };

        $scope.init();
    }
);
